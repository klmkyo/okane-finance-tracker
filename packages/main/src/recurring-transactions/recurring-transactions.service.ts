import { InjectQueue } from '@nestjs/bullmq'
import {
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { Queue } from 'bullmq'
import { Account, Database, RecurringTransaction } from 'database/schema'
import { and, eq } from 'drizzle-orm'
import * as pginterval from 'postgres-interval'
import { AccountsService } from 'src/accounts/accounts.service'
import { assert } from 'src/common/assert'
import { DB, SUCCESS } from 'src/common/constants'
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto'
import { GetRecurringTransactionDto } from './dto/get-recurring-transaction.dto'
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto'
import { RECURRING_TRANSACTIONS_QUEUE } from './recurring-transactions.constants'

const intervalToMilliseconds = (interval) => {
	const conversions = {
		years: 365.25 * 24 * 60 * 60 * 1000,
		months: 30 * 24 * 60 * 60 * 1000,
		days: 24 * 60 * 60 * 1000,
		hours: 60 * 60 * 1000,
		minutes: 60 * 1000,
		seconds: 1000,
		milliseconds: 1,
	}

	return Object.entries(interval).reduce(
		(total, [unit, value]) =>
			total + ((value as number) || 0) * conversions[unit],
		0,
	)
}

@Injectable()
export class RecurringTransactionsService {
	constructor(
		@Inject(DB) private db: Database,
		@InjectQueue(RECURRING_TRANSACTIONS_QUEUE)
		private recurringTransactionsQuene: Queue,
		private accountsService: AccountsService,
	) {}

	private jobName(transactionId: number | string) {
		return `process-tx:${transactionId}`
	}

	async create(userId: number, data: CreateRecurringTransactionDto) {
		const isUserAccount = await this.accountsService.isUserAccount(
			userId,
			data.accountId,
		)

		assert(isUserAccount, 'not_your_account', ForbiddenException)

		const [transaction] = await this.db
			.insert(RecurringTransaction)
			.values(data)
			.returning()

		const interval = pginterval(data.interval)
		const milis = intervalToMilliseconds(interval)
		const jobName = this.jobName(transaction.id)
		const job = await this.recurringTransactionsQuene.add(
			jobName,
			transaction,
			{
				repeat: {
					startDate: data.startDate,
					endDate: data.endDate,
					every: milis,
				},
			},
		)

		return transaction
	}

	private async getSchedulerByJobName(jobName: string) {
		const jobs = await this.recurringTransactionsQuene.getJobSchedulers()
		const [scheduler] = jobs.filter((job) => job.name === jobName)
		return scheduler
	}

	async find(userId: number, data: GetRecurringTransactionDto) {
		const transactions = await this.db
			.select()
			.from(RecurringTransaction)
			.leftJoin(Account, eq(Account.id, RecurringTransaction.accountId))
			.where(
				and(
					data.categoryId &&
						eq(RecurringTransaction.categoryId, data.categoryId),
					data.type && eq(RecurringTransaction.type, data.type),
					eq(RecurringTransaction.accountId, data.accountId),
					eq(Account.userId, userId),
				),
			)

		return transactions.map((tx) => tx.recurring_transactions)
	}

	async patch(
		userId: number,
		transactionId: number,
		data: UpdateRecurringTransactionDto,
	) {
		const getAccount = this.db
			.select()
			.from(Account)
			.where(eq(Account.id, data.accountId))

		const getTx = await this.db
			.select()
			.from(RecurringTransaction)
			.leftJoin(Account, eq(Account.id, RecurringTransaction.accountId))
			.where(
				and(
					eq(Account.userId, userId),
					eq(RecurringTransaction.id, transactionId),
				),
			)

		// dirty
		const [[account], [transaction]] = await Promise.all([getAccount, getTx])

		assert(
			!data.accountId || account?.userId === userId,
			'not_your_account',
			ForbiddenException,
		)
		assert(transaction, 'not_found', NotFoundException)

		const shouldUpdateJob = data.startDate || data.interval || data.endDate

		return await this.db.transaction(async (tx) => {
			const [updatedTransaction] = await tx
				.update(RecurringTransaction)
				.set(data)
				.where(eq(RecurringTransaction.id, transactionId))
				.returning()

			if (shouldUpdateJob) {
				const jobName = this.jobName(transactionId)
				const interval = pginterval(updatedTransaction.interval)
				const milis = intervalToMilliseconds(interval)

				// doing this way, upsert messes up ids
				await this.deleteJobByName(jobName)
				const job = await this.recurringTransactionsQuene.add(
					jobName,
					updatedTransaction,
					{
						repeat: {
							startDate: data.startDate,
							endDate: data.endDate,
							every: milis,
						},
					},
				)
			}

			return updatedTransaction
		})
	}

	async deleteJobByName(jobName: string) {
		const jobScheduler = await this.getSchedulerByJobName(jobName)
		await this.recurringTransactionsQuene.removeJobScheduler(jobScheduler.key)
	}

	async delete(userId: number, transactionId: number) {
		const [tx] = await this.db
			.select()
			.from(RecurringTransaction)
			.leftJoin(Account, eq(Account.id, RecurringTransaction.accountId))
			.where(
				and(
					eq(Account.userId, userId),
					eq(RecurringTransaction.id, transactionId),
				),
			)

		assert(tx, 'not_found', NotFoundException)

		await this.db.transaction(async (tx) => {
			await tx
				.delete(RecurringTransaction)
				.where(eq(RecurringTransaction.id, transactionId))
			await this.deleteJobByName(this.jobName(transactionId))
		})

		return SUCCESS
	}
}
