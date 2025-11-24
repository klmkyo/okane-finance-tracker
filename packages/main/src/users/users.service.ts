import {
    ConflictException,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { Database, User, UserInsert } from 'database/schema'
import { eq } from 'drizzle-orm'
import { assert } from 'src/common/assert'
import { DB } from 'src/common/constants'

@Injectable()
export class UsersService {
	constructor(@Inject(DB) private db: Database) {}

	async getById(userId: number) {
		const [user] = await this.db.select().from(User).where(eq(User.id, userId))
		assert(user, 'user_not_found')

		return user
	}

	async validate(username: string, password: string) {
		const [user] = await this.db
			.select()
			.from(User)
			.where(eq(User.username, username))

		if (!user) throw new UnauthorizedException()

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) throw new UnauthorizedException()

		return user
	}

	async register(userInsert: UserInsert) {
		const hash = await bcrypt.hash(userInsert.password, 10)
		try {
			const [user] = await this.db
				.insert(User)
				.values({
					...userInsert,
					password: hash,
				})
				.returning()
			const { password, ...publicUser } = user
			return publicUser
		} catch(e) {
		  console.log(e)
			throw new ConflictException('username_exists')
		}
	}
}
