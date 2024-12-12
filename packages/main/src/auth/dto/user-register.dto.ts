import {
	IsEmail,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator'

export class RegisterDto {
	@IsEmail()
	private email: string
	@IsString()
	private firstName: string
	@IsString()
	@IsOptional()
	private lastName: string
	@IsString()
	@MinLength(8)
	@MaxLength(372)
	private password: string
	@IsString()
	@MinLength(4)
	@MaxLength(32)
	private username: string
}
