import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from 'src/users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.registerAsync({
			global: true,
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				return {
					secret: config.get('auth.jwt.secret'),
					signOptions: { expiresIn: '365d' },
				}
			},
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
