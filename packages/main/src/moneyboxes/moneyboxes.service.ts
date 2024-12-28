import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Database, Moneybox } from 'database/schema'
import { and, eq } from 'drizzle-orm'
import { assert } from 'src/common/assert'
import { DB, SUCCESS } from 'src/common/constants'
import { CreateMoneyboxDto } from './dto/create-moneybox.dto'
import { UpdateMoneyboxDto } from './dto/update-moneybox.dto'

@Injectable()
export class MoneyboxesService {
	constructor(@Inject(DB) private db: Database) {}

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
}
