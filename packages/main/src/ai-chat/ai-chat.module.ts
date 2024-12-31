import { Module } from '@nestjs/common'
import { Models, OpenAIModule } from '@webeleon/nestjs-openai'
import { AiChatController } from './ai-chat.controller'
import { AiChatService } from './ai-chat.service'

@Module({
	imports: [
		OpenAIModule.forRoot({
			apiKey: 'YOUR_OPEN_AI_API_KEY',
			model: Models.GPT4,
		}),
	],

	controllers: [AiChatController],
	providers: [AiChatService],
})
export class AiChatModule {}
