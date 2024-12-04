import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from 'src/auth/guard/auth.guard'
import { UserId } from './decorators/user-id.decorator'
import { UsersService } from './users.service'

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('me')
	async getMe(@UserId() userId: number) {
		const { password, ...user } = await this.usersService.getById(userId)
		return user
	}
}
