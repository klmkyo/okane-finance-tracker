import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { RECURRING_TRANSACTIONS_QUEUE } from './recurring-transactions.constants'

@Processor(RECURRING_TRANSACTIONS_QUEUE)
export class RecurringTransactionsProcessor extends WorkerHost {
	async process(job: Job, token?: string): Promise<any> {
		console.log('HAHAHA: ', job)
		return 0
	}
}
