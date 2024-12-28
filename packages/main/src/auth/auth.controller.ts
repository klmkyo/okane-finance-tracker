import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/user-login.dto'
import { RegisterDto } from './dto/user-register.dto'
import { LocalAuthGuard } from './guard/local-auth.guard'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@UseGuards(LocalAuthGuard)
	login(@Request() req: any) {
		return this.authService.login(req.user)
	}

	// TODO this is broken
	@UseGuards(LocalAuthGuard)
	@Post('logout')
	async logout(@Request() req) {
		return req.logout()
	}

	@Post('register')
	register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto)
	}
}
