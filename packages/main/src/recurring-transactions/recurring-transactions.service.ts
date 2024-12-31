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
import { assert } from 'src/common/assert'
import { DB, SUCCESS } from 'src/common/constants'
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto'
import { GetRecurringTransactionDto } from './dto/get-recurring-transaction.dto'
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto'
import { RECURRING_TRANSACTIONS_QUEUE } from './recurring-transactions.constants'

const intervalToMilliseconds = (interval) => {
	const conversions = {
		years: 365.25 * 24 * 60 * 60 * 1000, // Approximate year
		months: 30 * 24 * 60 * 60 * 1000, // Approximate month
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
	) {}

	async create(userId: number, data: CreateRecurringTransactionDto) {
		const [account] = await this.db
			.select()
			.from(Account)
			.where(eq(Account.id, data.accountId))

		assert(account?.userId === userId, 'not_your_account', ForbiddenException)

		const [tx] = await this.db
			.insert(RecurringTransaction)
			.values(data)
			.returning()

		const interval = pginterval(data.interval)
		const milis = intervalToMilliseconds(interval)
		const a = await this.recurringTransactionsQuene.add('aa', data, {
			jobId: tx.id.toString(),
			repeat: {
				startDate: data.startDate,
				endDate: data.endDate,
				every: milis,
			},
		})

		console.log(a)

		// TODO: set every to correct
		// check if jobID is good and can be then removed
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
		const [[account], [tx]] = await Promise.all([getAccount, getTx])

		assert(
			!data.accountId || account?.userId === userId,
			'not_your_account',
			ForbiddenException,
		)
		assert(tx, 'not_found', NotFoundException)

		return await this.db
			.update(RecurringTransaction)
			.set(data)
			.where(eq(RecurringTransaction.id, transactionId))
			.returning()
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
		await this.db
			.delete(RecurringTransaction)
			.where(eq(RecurringTransaction.id, transactionId))

		await this.recurringTransactionsQuene.removeRepeatableByKey(
			transactionId.toString(),
		)

		return SUCCESS
	}
}
