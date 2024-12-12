import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { Database, UserSelect } from 'database/schema'
import { DB } from 'src/common/constants'
import { UsersService } from 'src/users/users.service'
import { LoginDto } from './dto/user-login.dto'
import { RegisterDto } from './dto/user-register.dto'

@Injectable()
export class AuthService {
		private db: Database
		private jwtService: JwtService
		private usersService: UsersService
	constructor(
		jwtService: JwtService,
		usersService: UsersService,
		@Inject(DB) db: Database,
	) {
		this.jwtService=jwtService;
		this.usersService=usersService;
		this.db=db;	
	}

	async login(user: UserSelect) {
		const payload = { sub: user.id }
		return {
			token: this.jwtService.sign(payload),
		}
	}

	async register(registerDto: RegisterDto) {
		return await this.usersService.register(registerDto)
	}

	async validate(username: string, password: string) {
		// we need to do it manualy
		const loginDto = plainToInstance(LoginDto, { username, password })
		const errors = await validate(loginDto)
		const errorMessages = errors.flatMap(({ constraints }) =>
			Object.values(constraints),
		)
		if (errorMessages.length > 0) throw new BadRequestException(errorMessages)

		return await this.usersService.validate(username, password)
	}
}
