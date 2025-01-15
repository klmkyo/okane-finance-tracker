import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator'
import { IsEmoji } from 'src/common/validators/is-emoji.validator'

export class CreateSavingGoalDto {
	@IsInt()
	moneyboxId: number

	@IsString()
	title: string

	@IsOptional()
	@IsString()
	description: string

	@IsNumber()
	targetAmount: number

	@IsString()
	@IsEmoji()
	icon: string
}
