import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/user-login.dto'
import { LocalAuthGuard } from './guard/local-auth.guard'
import { RegisterDto } from './dto/user-register.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@UseGuards(LocalAuthGuard)
	login(@Request() req: any) {
		return this.authService.login(req.user)
	}

	@Post('register')
	register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto)
	}
}
