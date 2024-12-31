import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { RECURRING_TRANSACTIONS_QUEUE } from './recurring-transactions.constants'
import { RecurringTransactionsController } from './recurring-transactions.controller'
import { RecurringTransactionsProcessor } from './recurring-transactions.processor'
import { RecurringTransactionsService } from './recurring-transactions.service'

@Module({
	imports: [
		BullModule.registerQueue({
			name: RECURRING_TRANSACTIONS_QUEUE,
		}),
	],
	controllers: [RecurringTransactionsController],
	providers: [RecurringTransactionsService, RecurringTransactionsProcessor],
})
export class RecurringTransactionsModule {}
