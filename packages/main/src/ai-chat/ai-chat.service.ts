import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AiChatConversation, Database } from 'database/schema'
import { and, eq } from 'drizzle-orm'
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

		return chat.history as OpenAI.Chat.Completions.ChatCompletionMessageParam[]
	}

	async chat(userId: number, message: string, chatId?: number) {
		let messages = [] as OpenAI.Chat.Completions.ChatCompletionMessageParam[]

		if (chatId) {
			messages = await this.getChatHistory(userId, chatId)
		} else {
			messages.push({ role: 'system', content: SYSTEM_PROMPT })
		}

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

		const [chat] = await this.db
			.insert(AiChatConversation)
			.values({
				...(chatId && { id: chatId }),
				userId,
				conversationLog: messages,
			} as any)
			.onConflictDoUpdate({
				target: AiChatConversation.id,
				set: { conversationLog: messages },
			})
			.returning()

		return { chatId: chat.id, response }
	}
}