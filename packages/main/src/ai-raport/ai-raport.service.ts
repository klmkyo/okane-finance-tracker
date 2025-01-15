import {
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
	Account,
	AiRaport,
	Category,
	Database,
	Transaction,
} from 'database/schema'
import { and, eq, gte, lte } from 'drizzle-orm'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources'
import { AccountsService } from 'src/accounts/accounts.service'
import { assert } from 'src/common/assert'
import { DB } from 'src/common/constants'
import { GenerateRaportDto } from './dto/generate-raport.dto'
import { RAPORT_SYSTEM_PROMPT } from './ai-raport.constants'

@Injectable()
export class AiRaportService {
	private client: OpenAI

	constructor(
		@Inject(DB) private db: Database,
		private config: ConfigService,
		private accountsService: AccountsService,
	) {
		const apiKey = this.config.get('openai.apiKey')
		this.client = new OpenAI({ apiKey })
	}

	async getRaport(userId: number, raportId: number) {
		const [raport] = await this.db
			.select({ reviewResponse: AiRaport.reviewResponse })
			.from(AiRaport)
			.leftJoin(Account, eq(Account.id, AiRaport.accountId))
			.where(and(eq(AiRaport.id, raportId), eq(Account.userId, userId)))

		assert(raport, 'raport_not_found', NotFoundException)

		return raport
	}

	async getAllRaports(userId: number, accountId: number) {
		const isUserAccount = await this.accountsService.isUserAccount(
			userId,
			accountId,
		)

		assert(isUserAccount, 'not_your_account', ForbiddenException)

		const raports = await this.db
			.select()
			.from(AiRaport)
			.where(eq(AiRaport.accountId, accountId))

		return raports
	}

	async generateRaport(userId: number, data: GenerateRaportDto) {
		const { accountId, periodStartDate, periodEndDate, notes } = data
		const isUserAccount = await this.accountsService.isUserAccount(
			userId,
			data.accountId,
		)
		assert(isUserAccount, 'not_your_account', ForbiddenException)

		const messages: Array<ChatCompletionMessageParam> = [
			{ role: 'system', content: RAPORT_SYSTEM_PROMPT },
		]

		const transactions = await this.db
			.select({
				date: Transaction.createdAt,
				type: Transaction.type,
				amount: Transaction.amount,
				category: Category.categoryName,
				title: Transaction.title,
				description: Transaction.description,
			})
			.from(Transaction)
			.leftJoin(Category, eq(Category.id, Transaction.categoryId))
			.where(
				and(
					eq(Transaction.accountId, accountId),
					gte(Transaction.createdAt, periodStartDate),
					lte(Transaction.createdAt, periodEndDate),
				),
			)

		assert(transactions.length > 0, 'you_dont_have_transactions')

		const prePrompt = `Transakcje od: ${periodStartDate} do ${periodEndDate}${notes ? `\nDodatkowe notatki od użytkownika: ${notes}` : ''}`

		const transactionsStringified = transactions.reduce((acc, tx) => {
			const transactionLine = `\n${tx.date} | ${tx.title} - ${tx.description} Kwota: ${tx.amount} Typ: ${tx.type} Kategoria: ${tx.category} `
			return acc + transactionLine
		}, '')

		let translationRemarks = ''

		if (data.language) {
			translationRemarks = ` Twoja wypowiedź musi być w języku, którego kod to ${data.language}.`
		}

		messages.push({
			role: 'system',
			content: prePrompt + transactionsStringified + translationRemarks,
		})

		if (notes) {
			messages.push({ role: 'user', content: notes })
		}

		const stream = await this.client.chat.completions.create({
			model: 'gpt-4o',
			messages,
			stream: true,
			user: userId.toString(),
		})

		const response = { role: 'assistant', content: '' }
		for await (const chunk of stream) {
			response.content += chunk.choices[0]?.delta?.content || ''
		}

		console.log(messages)
		const [raport] = await this.db
			.insert(AiRaport)
			.values({
				accountId,
				periodEndDate,
				periodStartDate,
				reviewResponse: response,
			} as any)
			.returning()

		return raport
	}

	async deleteRaport(userId: number, raportId: number) {
		const [raport] = await this.db
			.select()
			.from(AiRaport)
			.leftJoin(Account, eq(Account.id, AiRaport.accountId))
			.where(and(eq(AiRaport.id, raportId), eq(Account.userId, userId)))

		assert(raport, 'raport_not_found', NotFoundException)

		await this.db.delete(AiRaport).where(eq(AiRaport.id, raportId))

		return { success: true }
	}
}
