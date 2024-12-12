import { IsString, MaxLength, MinLength } from 'class-validator'

export class LoginDto {
	@IsString()
	@MinLength(8)
	@MaxLength(372)
	private password: string
	@IsString()
	@MinLength(4)
	@MaxLength(32)
	private username: string
}
