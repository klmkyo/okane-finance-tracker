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
import { SYSTEM_PROMPT } from 'src/ai-chat/ai-chat.constants'
import { assert } from 'src/common/assert'
import { DB } from 'src/common/constants'
import { GenerateRaportDto } from './dto/generate-raport.dto'

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

	async generateRaport(userId: number, data: GenerateRaportDto) {
		const { accountId, periodStartDate, periodEndDate } = data
		const isUserAccount = await this.accountsService.isUserAccount(
			userId,
			data.accountId,
		)
		assert(isUserAccount, 'not_your_account', ForbiddenException)

		const messages: Array<ChatCompletionMessageParam> = [
			{ role: 'system', content: SYSTEM_PROMPT },
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

		const prePrompt = `Transakcje od: ${periodStartDate} do ${periodEndDate}`
		const transactionsStringified = transactions.reduce((acc, tx) => {
			const transactionLine = `${tx.date} | ${tx.title} - ${tx.description} Kwota: ${tx.amount}\
		    Typ: ${tx.type} Kategoria: ${tx.category} `
			return acc + transactionLine
		}, '')

		messages.push({
			role: 'user',
			content: prePrompt + transactionsStringified,
		})

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
}
