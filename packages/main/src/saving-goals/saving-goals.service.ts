import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Database, Moneybox, SavingGoal } from 'database/schema'
import { and, eq, sql } from 'drizzle-orm'
import { assert } from 'src/common/assert'
import { DB, SUCCESS } from 'src/common/constants'
import { CreateSavingGoalDto } from './dto/create-saving-goal.dto'
import { UpdateSavingGoalDto } from './dto/update-saving-goal.dto'
import { AccountsService } from 'src/accounts/accounts.service'

@Injectable()
export class SavingGoalsService {
	constructor(
		@Inject(DB) private db: Database,
		private accountsService: AccountsService,
	) {}

	async create(userId: number, data: CreateSavingGoalDto) {
		const [moneybox] = await this.db
			.select()
			.from(Moneybox)
			.where(and(eq(Moneybox.userId, userId), eq(Moneybox.id, data.moneyboxId)))

		assert(moneybox, 'moneybox_not_found', NotFoundException)

		return await this.db
			.insert(SavingGoal)
			.values({ ...data, userId })
			.returning()
	}

	async find(userId: number) {
		const result = await this.db
			.select()
			.from(SavingGoal)
			.leftJoin(Moneybox, eq(Moneybox.id, SavingGoal.moneyboxId))
			.where(eq(SavingGoal.userId, userId))

		return result.map(({ saving_goals: goal, moneyboxes: moneybox }) => {
			const isCompleted = moneybox.balance >= goal.targetAmount
			return { ...goal, amount: moneybox.balance, isCompleted }
		})
	}

	async update(
		userId: number,
		savingGoalId: number,
		data: UpdateSavingGoalDto,
	) {
		const [savingGoal] = await this.db
			.update(SavingGoal)
			.set(data)
			.where(
				and(eq(SavingGoal.id, savingGoalId), eq(SavingGoal.userId, userId)),
			)
			.returning()

		assert(savingGoal, 'saving_goal_not_found', NotFoundException)
		return savingGoal
	}

	async delete(userId: number, savingGoalId: number) {
		const [savingGoal] = await this.db
			.delete(SavingGoal)
			.where(
				and(eq(SavingGoal.userId, userId), eq(SavingGoal.id, savingGoalId)),
			)
			.returning()

		assert(savingGoal, 'saving_goal_not_found', NotFoundException)
		return SUCCESS
	}

	async withdraw(
		userId: number,
		moneyboxId: number,
		accountId: number,
		amount: number,
	) {
		const [moneybox] = await this.db
			.select()
			.from(Moneybox)
			.where(and(eq(Moneybox.id, moneyboxId), eq(Moneybox.userId, userId)))

		assert(moneybox, 'moneybox_not_found', NotFoundException)
		assert(moneybox.balance >= amount, 'insufficient_funds', NotFoundException)

		// Verify account ownership
		await this.accountsService.findOne(userId, accountId)

		return await this.db.transaction(async (tx) => {
			// Subtract from moneybox
			const [updatedMoneybox] = await tx
				.update(Moneybox)
				.set({ balance: sql`${Moneybox.balance} - ${amount}` } as any)
				.where(eq(Moneybox.id, moneyboxId))
				.returning()

			// Add to account
			await this.accountsService.credit(accountId, amount, tx)

			return updatedMoneybox
		})
	}
}
