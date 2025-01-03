import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from 'src/auth/guard/auth.guard'
import { UserId } from 'src/users/decorators/user-id.decorator'
import { AiRaportService } from './ai-raport.service'
import { GenerateRaportDto } from './dto/generate-raport.dto'

@UseGuards(AuthGuard)
@Controller('ai-raport')
export class AiRaportController {
	constructor(private aiRaportService: AiRaportService) {}

	@Post()
	async generateRaport(
		@UserId() userId: number,
		@Body() body: GenerateRaportDto,
	) {
		return await this.aiRaportService.generateRaport(userId, body)
	}

	@Get(':id')
	async getRaport(@UserId() userId: number, @Param('id') chatId: string) {
		return await this.aiRaportService.getRaport(userId, +chatId)
	}
}
