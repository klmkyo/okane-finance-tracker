import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from '../auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	private authService;
	constructor(authService: AuthService) {
		super()
	}

	// it gets username and password from JSON body
	async validate(username: string, password: string) {
		return await this.authService.validate(username, password)
	}
}
