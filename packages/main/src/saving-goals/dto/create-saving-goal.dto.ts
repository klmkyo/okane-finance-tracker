import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator'

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
}
