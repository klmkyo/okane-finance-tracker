import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
import { AuthGuard } from 'src/auth/guard/auth.guard'
import { UserId } from 'src/users/decorators/user-id.decorator'
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto'
import { GetRecurringTransactionDto } from './dto/get-recurring-transaction.dto'
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto'
import { RecurringTransactionsService } from './recurring-transactions.service'

@UseGuards(AuthGuard)
@Controller('recurring-transactions')
export class RecurringTransactionsController {
	constructor(
		private recurringTransactionsService: RecurringTransactionsService,
	) {}

	@Post()
	async create(
		@UserId() userId: number,
		@Body() body: CreateRecurringTransactionDto,
	) {
		return await this.recurringTransactionsService.create(userId, body)
	}

	@Get()
	async find(
		@UserId() userId: number,
		@Query() query: GetRecurringTransactionDto,
	) {
		return await this.recurringTransactionsService.find(userId, query)
	}

	@Patch(':id')
	async update(
		@UserId() userId: number,
		@Param('id') transactionId: string,
		@Body() body: UpdateRecurringTransactionDto,
	) {
		return await this.recurringTransactionsService.patch(
			userId,
			+transactionId,
			body,
		)
	}

	@Delete(':id')
	async delete(@UserId() userId: number, @Param('id') transactionId: string) {
		return await this.recurringTransactionsService.delete(
			userId,
			+transactionId,
		)
	}
}
