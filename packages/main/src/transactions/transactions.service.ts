import {
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { Account, Database, Transaction } from 'database/schema'
import { and, eq } from 'drizzle-orm'
import { assert } from 'src/common/assert'
import { DB, SUCCESS } from 'src/common/constants'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { GetTransactionDto } from './dto/get-transaction.dto'
import { UpdateTransactionDto } from './dto/update-transaction.dto'

@Injectable()
export class TransactionsService {
	constructor(@Inject(DB) private db: Database) {}

	async create(userId: number, data: CreateTransactionDto) {
		const [account] = await this.db
			.select()
			.from(Account)
			.where(eq(Account.id, data.accountId))

		assert(account?.userId === userId, 'not_your_account', ForbiddenException)

		return await this.db.insert(Transaction).values(data).returning()
	}

	async find(userId: number, data: GetTransactionDto) {
		const transactions = await this.db
			.select()
			.from(Transaction)
			.leftJoin(Account, eq(Account.id, Transaction.accountId))
			.where(
				and(
					data.categoryId && eq(Transaction.categoryId, data.categoryId),
					data.type && eq(Transaction.type, data.type),
					eq(Transaction.accountId, data.accountId),
					eq(Account.userId, userId),
				),
			)

		return transactions.map((tx) => tx.transactions)
	}

	async patch(
		userId: number,
		transactionId: number,
		data: UpdateTransactionDto,
	) {
		const getAccount = this.db
			.select()
			.from(Account)
			.where(eq(Account.id, data.accountId))

		const getTx = await this.db
			.select()
			.from(Transaction)
			.leftJoin(Account, eq(Account.id, Transaction.accountId))
			.where(and(eq(Account.userId, userId), eq(Transaction.id, transactionId)))

		// dirty
		const [[account], [tx]] = await Promise.all([getAccount, getTx])

		assert(
			!data.accountId || account?.userId === userId,
			'not_your_account',
			ForbiddenException,
		)
		assert(tx, 'not_found', NotFoundException)

		return await this.db
			.update(Transaction)
			.set(data)
			.where(eq(Transaction.id, transactionId))
			.returning()
	}

	async delete(userId: number, transactionId: number) {
		const [tx] = await this.db
			.select()
			.from(Transaction)
			.leftJoin(Account, eq(Account.id, Transaction.accountId))
			.where(and(eq(Account.userId, userId), eq(Transaction.id, transactionId)))

		assert(tx, 'not_found', NotFoundException)
		await this.db.delete(Transaction).where(eq(Transaction.id, transactionId))

		return SUCCESS
	}
}
