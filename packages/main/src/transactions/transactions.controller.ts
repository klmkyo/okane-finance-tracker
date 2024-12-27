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
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { GetTransactionDto } from './dto/get-transaction.dto'
import { UpdateTransactionDto } from './dto/update-transaction.dto'
import { TransactionsService } from './transactions.service'

@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionsController {
	constructor(private readonly transactionsService: TransactionsService) {}

	@Post()
	async create(@UserId() userId: number, @Body() body: CreateTransactionDto) {
		return await this.transactionsService.create(userId, body)
	}

	@Get()
	async find(@UserId() userId: number, @Body() body: GetTransactionDto) {
		return await this.transactionsService.find(userId, body)
	}

	@Patch(':id')
	async update(
		@UserId() userId: number,
		@Param('id') transactionId: string,
		@Body() body: UpdateTransactionDto,
	) {
		return await this.transactionsService.patch(userId, +transactionId, body)
	}

	@Delete(':id')
	async delete(@UserId() userId: number, @Param('id') transactionId: string) {
		return await this.transactionsService.delete(userId, +transactionId)
	}
}
