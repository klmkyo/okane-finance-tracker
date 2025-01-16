import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Database, Moneybox } from 'database/schema'
import { and, eq, sql } from 'drizzle-orm'
import { assert } from 'src/common/assert'
import { DB, SUCCESS } from 'src/common/constants'
import { CreateMoneyboxDto } from './dto/create-moneybox.dto'
import { UpdateMoneyboxDto } from './dto/update-moneybox.dto'
import { AccountsService } from 'src/accounts/accounts.service'

@Injectable()
export class MoneyboxesService {
	constructor(
		@Inject(DB) private db: Database,
		private accountsService: AccountsService,
	) {}

	async create(userId: number, data: CreateMoneyboxDto) {
		return await this.db
			.insert(Moneybox)
			.values({ ...data, userId })
			.returning()
	}

	async find(userId: number) {
		return await this.db
			.select()
			.from(Moneybox)
			.where(eq(Moneybox.userId, userId))
	}

	async update(userId: number, moneyboxId: number, data: UpdateMoneyboxDto) {
		const [moneybox] = await this.db
			.update(Moneybox)
			.set(data)
			.where(and(eq(Moneybox.id, moneyboxId), eq(Moneybox.userId, userId)))
			.returning()

		assert(moneybox, 'moneybox_not_found', NotFoundException)
		return moneybox
	}

	async delete(userId: number, moneyboxId: number) {
		const [moneybox] = await this.db
			.delete(Moneybox)
			.where(and(eq(Moneybox.userId, userId), eq(Moneybox.id, moneyboxId)))
			.returning()

		assert(moneybox, 'moneybox_not_found', NotFoundException)
		return SUCCESS
	}

	async deposit(
		userId: number,
		moneyboxId: number,
		accountId: number,
		amount: number,
	) {
		// Verify ownership and existence
		const [moneybox] = await this.db
			.select()
			.from(Moneybox)
			.where(and(eq(Moneybox.id, moneyboxId), eq(Moneybox.userId, userId)))

		assert(moneybox, 'moneybox_not_found', NotFoundException)

		// Verify account ownership
		await this.accountsService.findOne(userId, accountId)

		return await this.db.transaction(async (tx) => {
			// Charge the source account
			await this.accountsService.charge(accountId, amount, tx)

			// Update moneybox balance
			const [updatedMoneybox] = await tx
				.update(Moneybox)
				.set({ balance: sql`${Moneybox.balance} + ${amount}` } as any)
				.where(eq(Moneybox.id, moneyboxId))
				.returning()

			return updatedMoneybox
		})
	}
}
