import {
	Body,
	Controller,
	Delete,
	Get,
	NotFoundException,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common'
import { AuthGuard } from 'src/auth/guard/auth.guard'
import { UserId } from 'src/users/decorators/user-id.decorator'
import { assert } from 'src/common/assert'
import { CreateSavingGoalDto } from './dto/create-saving-goal.dto'
import { UpdateSavingGoalDto } from './dto/update-saving-goal.dto'
import { SavingGoalsService } from './saving-goals.service'

@UseGuards(AuthGuard)
@Controller('saving-goals')
export class SavingGoalsController {
	constructor(private readonly savingGoalsService: SavingGoalsService) {}

	@Post()
	async create(@UserId() userId: number, @Body() body: CreateSavingGoalDto) {
		return this.savingGoalsService.create(userId, body)
	}

	@Get()
	async find(@UserId() userId: number) {
		return await this.savingGoalsService.find(userId)
	}

	@Patch(':id')
	async update(
		@UserId() userId: number,
		@Param('id') savingGoalId: string,
		@Body() updateSavingGoalDto: UpdateSavingGoalDto,
	) {
		return await this.savingGoalsService.update(
			userId,
			+savingGoalId,
			updateSavingGoalDto,
		)
	}

	@Delete(':id')
	async delete(@UserId() userId: number, @Param('id') savingGoalId: string) {
		return this.savingGoalsService.delete(userId, +savingGoalId)
	}

	@Post(':id/withdraw')
	async withdraw(
		@UserId() userId: number,
		@Param('id') savingGoalId: string,
		@Body() body: { accountId: number; amount: number },
	) {
		const goals = await this.savingGoalsService.find(userId)
		const goal = goals.find((g) => g.id === +savingGoalId)
		assert(goal, 'saving_goal_not_found', NotFoundException)

		return await this.savingGoalsService.withdraw(
			userId,
			goal.moneyboxId,
			body.accountId,
			body.amount,
		)
	}
}
