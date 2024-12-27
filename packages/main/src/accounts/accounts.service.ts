import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Account, Database } from 'database/schema'
import { and, eq } from 'drizzle-orm'
import { assert } from 'src/common/assert'
import { DB, SUCCESS } from 'src/common/constants'
import { CreateAccountDto } from './dto/create-account.dto'
import { UpdateAccountDto } from './dto/update-account.dto'

@Injectable()
export class AccountsService {
	constructor(@Inject(DB) private db: Database) {}

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

	async update(userId: number, accountId: number, data: UpdateAccountDto) {
		const [account] = await this.db
			.update(Account)
			.set(data)
			.where(and(eq(Account.id, accountId), eq(Account.userId, userId)))
			.returning()

		assert(account, 'account_not_found', NotFoundException)
		return account
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
