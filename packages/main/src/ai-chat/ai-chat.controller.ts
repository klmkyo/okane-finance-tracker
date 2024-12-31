import { Controller } from '@nestjs/common'
import { AiChatService } from './ai-chat.service'

@Controller('ai-chat')
export class AiChatController {
	constructor(private readonly aiChatService: AiChatService) {}
}
