import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common'
import { AuthGuard } from 'src/auth/guard/auth.guard'
import { UserId } from 'src/users/decorators/user-id.decorator'
import { CreateMoneyboxDto } from './dto/create-moneybox.dto'
import { UpdateMoneyboxDto } from './dto/update-moneybox.dto'
import { MoneyboxesService } from './moneyboxes.service'

@UseGuards(AuthGuard)
@Controller('moneyboxes')
export class MoneyboxesController {
	constructor(private readonly moneyboxesService: MoneyboxesService) {}

	@Post()
	async create(@UserId() userId: number, @Body() body: CreateMoneyboxDto) {
		return this.moneyboxesService.create(userId, body)
	}

	@Get()
	async find(@UserId() userId: number) {
		return await this.moneyboxesService.find(userId)
	}

	@Patch(':id')
	async update(
		@UserId() userId: number,
		@Param('id') moneyboxId: string,
		@Body() updateMoneyboxDto: UpdateMoneyboxDto,
	) {
		return await this.moneyboxesService.update(
			userId,
			+moneyboxId,
			updateMoneyboxDto,
		)
	}

	@Delete(':id')
	async delete(@UserId() userId: number, @Param('id') moneyboxId: string) {
		return this.moneyboxesService.delete(userId, +moneyboxId)
	}

	@Post(':id/deposit')
	async deposit(
		@UserId() userId: number,
		@Param('id') moneyboxId: string,
		@Body() body: { accountId: number; amount: number },
	) {
		return await this.moneyboxesService.deposit(
			userId,
			+moneyboxId,
			body.accountId,
			body.amount,
		)
	}
}
