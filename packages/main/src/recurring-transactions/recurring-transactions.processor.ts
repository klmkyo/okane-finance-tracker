import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { TransactionInsert } from 'database/schema'
import { AccountsService } from 'src/accounts/accounts.service'
import { RECURRING_TRANSACTIONS_QUEUE } from './recurring-transactions.constants'

@Processor(RECURRING_TRANSACTIONS_QUEUE)
export class RecurringTransactionsProcessor extends WorkerHost {
	constructor(private accountsService: AccountsService) {
		super()
	}

	async process(job: Job<TransactionInsert>, token?: string): Promise<any> {
		const { type, accountId, amount } = job.data
		return await this.accountsService.updateBalance(type, accountId, amount)
	}
}
