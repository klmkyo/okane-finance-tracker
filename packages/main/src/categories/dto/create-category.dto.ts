import { IsInt, IsOptional, IsString } from 'class-validator'

export class CreateCategoryDto {
	@IsString()
	categoryName: string

	@IsOptional()
	@IsInt()
	parentCategoryId?: number
}
