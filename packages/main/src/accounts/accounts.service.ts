import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Account, Database } from 'database/schema'
import { and, eq, sql } from 'drizzle-orm'
import { assert } from 'src/common/assert'
import { DB, SUCCESS } from 'src/common/constants'
import { TransactionType } from 'src/common/types'
import { CreateAccountDto } from './dto/create-account.dto'
import { UpdateAccountDto } from './dto/update-account.dto'

@Injectable()
export class AccountsService {
	constructor(@Inject(DB) private db: Database) {}

	async credit(accountId: number, amount: number) {
		const [account] = await this.db
			.update(Account)
			.set({ balance: sql`${Account.balance} + ${amount}` } as any)
			.where(and(eq(Account.id, accountId)))
			.returning()
		return account
	}

	async charge(accountId: number, amount: number) {
		const [account] = await this.db
			.update(Account)
			.set({ balance: sql`${Account.balance} - ${amount}` } as any)
			.where(and(eq(Account.id, accountId)))
			.returning()
		return account
	}

	async updateBalance(
		type: TransactionType,
		accountId: number,
		amount: number,
	) {
		switch (type) {
			case 'withdraw':
				return await this.charge(accountId, amount)
			case 'deposit':
				return await this.credit(accountId, amount)
		}
	}

	async create(userId: number, data: CreateAccountDto) {
		return await this.db
			.insert(Account)
			.values({ ...data, userId })
			.returning()
	}

	async find(userId: number) {
		return await this.db
			.select()
			.from(Account)
			.where(eq(Account.userId, userId))
	}

	async findOne(userId: number, accountId: number) {
		const [account] = await this.db
			.select()
			.from(Account)
			.where(and(eq(Account.id, accountId), eq(Account.userId, userId)))

		assert(account, 'account_not_found', NotFoundException)

		return account
	}

	async update(userId: number, accountId: number, data: UpdateAccountDto) {
		const [account] = await this.db
			.update(Account)
			.set(data)
			.where(and(eq(Account.id, accountId), eq(Account.userId, userId)))
			.returning()

		assert(account, 'account_not_found', NotFoundException)
		return account
	}

	async isUserAccount(userId: number, accountId: number) {
		const accounts = await this.find(userId)
		return accounts.some((acc) => acc.id === accountId)
	}

	async delete(userId: number, accountId: number) {
		const [account] = await this.db
			.delete(Account)
			.where(and(eq(Account.userId, userId), eq(Account.id, accountId)))
			.returning()

		assert(account, 'account_not_found', NotFoundException)
		return SUCCESS
	}
}
