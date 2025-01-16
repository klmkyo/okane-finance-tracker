import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
import { AuthGuard } from 'src/auth/guard/auth.guard'
import { UserId } from 'src/users/decorators/user-id.decorator'
import { AiChatService } from './ai-chat.service'
import { ChatDto } from './dto/chat.dto'

@UseGuards(AuthGuard)
@Controller('ai-chat')
export class AiChatController {
	constructor(private aiChatService: AiChatService) {}

	@Get()
	async getAllChats(@UserId() userId: number) {
		return await this.aiChatService.getAllChats(userId)
	}

	@Post(':id?')
	async chat(
		@UserId() userId: number,
		@Body() body: ChatDto,
		@Query('accountId') accountId: string,
		@Param('id') chatId?: string,
	) {
		return await this.aiChatService.chat(
			userId,
			body.message,
			+accountId,
			+chatId,
		)
	}

	@Get(':id')
	async getChatHistory(@UserId() userId: number, @Param('id') chatId: string) {
		return await this.aiChatService.getChatHistory(userId, +chatId)
	}
}
