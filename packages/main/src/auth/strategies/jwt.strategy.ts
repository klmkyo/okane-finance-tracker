import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(config: ConfigService) {
		super({
			// Cookie name: "token"
			jwtFromRequest: (req: Request) => req.cookies?.token,
			ignoreExpiration: false,
			secretOrKey: config.get('auth.jwt.secret'),
		})
	}

	async validate(payload: any) {
		const userId = payload.sub
		return { id: userId }
	}
}
