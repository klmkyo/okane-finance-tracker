import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
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

	@Get()
	async getAllRaports(
		@UserId() userId: number,
		@Query('accountId') accountId: string,
	) {
		return await this.aiRaportService.getAllRaports(userId, +accountId)
	}

	@Get(':id')
	async getRaport(@UserId() userId: number, @Param('id') chatId: string) {
		return await this.aiRaportService.getRaport(userId, +chatId)
	}

	@Delete(':id')
	async deleteRaport(@UserId() userId: number, @Param('id') raportId: string) {
		return await this.aiRaportService.deleteRaport(userId, +raportId)
	}
}
