import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common'
import { AuthGuard } from 'src/auth/guard/auth.guard'
import { UserId } from 'src/users/decorators/user-id.decorator'
import { AccountsService } from './accounts.service'
import { CreateAccountDto } from './dto/create-account.dto'
import { UpdateAccountDto } from './dto/update-account.dto'

@UseGuards(AuthGuard)
@Controller('accounts')
export class AccountsController {
	constructor(private readonly accountsService: AccountsService) {}

	@Post()
	async create(@UserId() userId: number, @Body() body: CreateAccountDto) {
		return this.accountsService.create(userId, body)
	}

	@Get()
	async find(@UserId() userId: number) {
		return await this.accountsService.find(userId)
	}

	@Patch(':id')
	async update(
		@UserId() userId: number,
		@Param('id') accountId: string,
		@Body() updateAccountDto: UpdateAccountDto,
	) {
		return await this.accountsService.update(
			userId,
			+accountId,
			updateAccountDto,
		)
	}

	@Delete(':id')
	async delete(@UserId() userId: number, @Param('id') accountId: string) {
		return this.accountsService.delete(userId, +accountId)
	}
}
