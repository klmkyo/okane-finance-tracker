import { IsString, MaxLength, MinLength } from 'class-validator'

export class LoginDto {
	@IsString()
	@MinLength(4)
	@MaxLength(32)
	username: string

	@IsString()
	@MinLength(8)
	@MaxLength(372)
	password: string
}
