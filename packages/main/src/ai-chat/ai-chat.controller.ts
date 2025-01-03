import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from 'src/auth/guard/auth.guard'
import { UserId } from 'src/users/decorators/user-id.decorator'
import { AiChatService } from './ai-chat.service'
import { ChatDto } from './dto/chat.dto'

@UseGuards(AuthGuard)
@Controller('ai-chat')
export class AiChatController {
	constructor(private aiChatService: AiChatService) {}

	@Post(':id?')
	async chat(
		@UserId() userId: number,
		@Body() body: ChatDto,
		@Param('id') chatId?: string,
	) {
		return await this.aiChatService.chat(userId, body.message, +chatId)
	}

	@Get(':id')
	async getChatHistory(@UserId() userId: number, @Param('id') chatId: string) {
		return await this.aiChatService.getChatHistory(userId, +chatId)
	}
}
