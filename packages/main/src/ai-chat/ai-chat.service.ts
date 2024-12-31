import { Injectable } from '@nestjs/common'
import { OpenAIService } from '@webeleon/nestjs-openai'

@Injectable()
export class AiChatService {
	constructor(private openAiService: OpenAIService) {}

	async chat() {}
}
