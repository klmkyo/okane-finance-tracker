import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Database, Moneybox, SavingGoal } from 'database/schema'
import { and, eq } from 'drizzle-orm'
import { assert } from 'src/common/assert'
import { DB, SUCCESS } from 'src/common/constants'
import { CreateSavingGoalDto } from './dto/create-saving-goal.dto'
import { UpdateSavingGoalDto } from './dto/update-saving-goal.dto'

@Injectable()
export class SavingGoalsService {
	constructor(@Inject(DB) private db: Database) {}

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
}
