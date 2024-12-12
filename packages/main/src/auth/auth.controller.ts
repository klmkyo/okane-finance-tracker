import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/user-login.dto'
import { LocalAuthGuard } from './guard/local-auth.guard'
import { RegisterDto } from './dto/user-register.dto'

@Controller('auth')
export class AuthController {
	private authService: AuthService
	constructor(authService: AuthService) {
		this.authService=authService
	}

	@Post('login')
	@UseGuards(LocalAuthGuard)
	private login(@Request() req: any) {
		return this.authService.login(req.user)
	}

	

	@Post('register')
	private register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto)
	}

// TODO this is broken
	@UseGuards(LocalAuthGuard)
	@Post('logout')
	async logout(@Request() req) {
		return req.logout()
	}
}
