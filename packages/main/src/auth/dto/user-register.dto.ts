import {
	IsEmail,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator'

export class RegisterDto {
	@IsString()
	@MinLength(4)
	@MaxLength(32)
	username: string

	@IsString()
	@MinLength(8)
	@MaxLength(372)
	password: string

	@IsEmail()
	email: string

	@IsString()
	firstName: string

	@IsString()
	@IsOptional()
	lastName: string
}
