import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common'
import { Database, User } from 'database/schema'
import { DB } from 'src/common/constants'
import { eq, sql } from 'drizzle-orm'
import { assert } from 'src/common/assert'

@Injectable()
export class AdminService {
	constructor(@Inject(DB) private db: Database) {}

	async getAllUsers() {
		const users = await this.db.select().from(User)
		// Remove passwords from response
		return users.map(({ password, ...user }) => user)
	}

	async blockUser(userId: number) {
		const user = await this.db.select().from(User).where(eq(User.id, userId))
		assert(user[0], 'user_not_found')

		if (user[0].isBlocked) {
			throw new BadRequestException('user_already_blocked')
		}

		await this.db.execute(
			sql`UPDATE "users" SET "is_blocked" = 1 WHERE "id" = ${userId}`
		)

		const [updatedUser] = await this.db
			.select()
			.from(User)
			.where(eq(User.id, userId))

		const { password, ...publicUser } = updatedUser
		return publicUser
	}

	async unblockUser(userId: number) {
		const user = await this.db.select().from(User).where(eq(User.id, userId))
		assert(user[0], 'user_not_found')

		if (!user[0].isBlocked) {
			throw new BadRequestException('user_not_blocked')
		}

		await this.db.execute(
			sql`UPDATE "users" SET "is_blocked" = 0 WHERE "id" = ${userId}`
		)

		const [updatedUser] = await this.db
			.select()
			.from(User)
			.where(eq(User.id, userId))

		const { password, ...publicUser } = updatedUser
		return publicUser
	}

	async promoteToAdmin(userId: number) {
		const user = await this.db.select().from(User).where(eq(User.id, userId))
		assert(user[0], 'user_not_found')

		if (user[0].role === 'ADMIN') {
			throw new BadRequestException('user_already_admin')
		}

		await this.db.execute(
			sql`UPDATE "users" SET "role" = 'ADMIN' WHERE "id" = ${userId}`
		)

		const [updatedUser] = await this.db
			.select()
			.from(User)
			.where(eq(User.id, userId))

		const { password, ...publicUser } = updatedUser
		return publicUser
	}

	async demoteFromAdmin(userId: number) {
		const user = await this.db.select().from(User).where(eq(User.id, userId))
		assert(user[0], 'user_not_found')

		if (user[0].role !== 'ADMIN') {
			throw new BadRequestException('user_not_admin')
		}

		await this.db.execute(
			sql`UPDATE "users" SET "role" = 'USER' WHERE "id" = ${userId}`
		)

		const [updatedUser] = await this.db
			.select()
			.from(User)
			.where(eq(User.id, userId))

		const { password, ...publicUser } = updatedUser
		return publicUser
	}

	async deleteUser(userId: number) {
		const user = await this.db.select().from(User).where(eq(User.id, userId))
		assert(user[0], 'user_not_found')

		await this.db.delete(User).where(eq(User.id, userId))
		return { message: 'User deleted successfully' }
	}
}
