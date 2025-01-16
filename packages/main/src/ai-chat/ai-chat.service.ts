import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
	Account,
	AiChatConversation,
	Category,
	Database,
	Transaction,
} from 'database/schema'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import OpenAI from 'openai'
import { assert } from 'src/common/assert'
import { DB } from 'src/common/constants'
import { SYSTEM_PROMPT } from './ai-chat.constants'

@Injectable()
export class AiChatService {
	private client: OpenAI

	constructor(
		@Inject(DB) private db: Database,
		private config: ConfigService,
	) {
		const apiKey = this.config.get('openai.apiKey')
		this.client = new OpenAI({ apiKey })
	}

	async getChatHistory(userId: number, chatId: number) {
		const [chat] = await this.db
			.select({ history: AiChatConversation.conversationLog })
			.from(AiChatConversation)
			.where(
				and(
					eq(AiChatConversation.userId, userId),
					eq(AiChatConversation.id, chatId),
				),
			)

		assert(chat, 'chat_not_found', NotFoundException)

		const history =
			chat.history as OpenAI.Chat.Completions.ChatCompletionMessageParam[]

		const historyWithoutSystemPrompt = history.filter(
			(message) => message.role !== 'system',
		)

		return historyWithoutSystemPrompt
	}

	async getAllChats(userId: number) {
		const chats = await this.db
			.select({
				id: AiChatConversation.id,
				conversationLog: AiChatConversation.conversationLog,
				createdAt: AiChatConversation.createdAt,
				title: AiChatConversation.title,
			})
			.from(AiChatConversation)
			.where(eq(AiChatConversation.userId, userId))
			.orderBy(desc(AiChatConversation.createdAt))

		return chats.map((chat) => ({
			...chat,
			conversationLog: (
				chat.conversationLog as OpenAI.Chat.Completions.ChatCompletionMessageParam[]
			).filter((message) => message.role !== 'system'),
		}))
	}

	async chat(
		userId: number,
		message: string,
		accountId: number,
		chatId?: number,
	) {
		let messages = [] as OpenAI.Chat.Completions.ChatCompletionMessageParam[]

		if (chatId) {
			messages = await this.getChatHistory(userId, chatId)
		} else {
			messages.push({ role: 'system', content: SYSTEM_PROMPT })
		}

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
			.where(eq(Transaction.accountId, accountId))
			.limit(100)

		const transactionsString = transactions
			.map((tx) => `${tx.date} | ${tx.title} (${tx.amount} - ${tx.category})`)
			.join('\n')

		messages.unshift({
			role: 'system',
			content: `Here are up to your last 100 transactions:\n${transactionsString}`,
		})

		messages.push({ role: 'user', content: message })

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

		messages.push(response as any)

		let title: string | undefined
		if (!chatId) {
			const titleResponse = await this.client.chat.completions.create({
				model: 'gpt-4o-mini',
				messages: [
					{
						role: 'system',
						content:
							"Generate a short, concise title (max 50 characters) for this chat based on the user's message. The title should be in the same language as the message. Just return the title, nothing else.",
					},
					{ role: 'user', content: message },
				],
				temperature: 0.7,
				max_tokens: 20,
			})

			title = titleResponse.choices[0]?.message?.content?.trim()
		}

		const [chat] = await this.db
			.insert(AiChatConversation)
			.values({
				...(chatId && { id: chatId }),
				userId,
				conversationLog: messages,
				...(title && { title }),
			} as any)
			.onConflictDoUpdate({
				target: AiChatConversation.id,
				set: { conversationLog: messages },
			})
			.returning()

		return { chatId: chat.id, response }
	}
}
