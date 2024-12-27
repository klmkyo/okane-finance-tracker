import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AccountsModule } from './accounts/accounts.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { configuration } from './config/configuration'
import { DrizzleModule } from './drizzle/drizzle.module'
import { TransactionsModule } from './transactions/transactions.module'
import { UsersModule } from './users/users.module'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, load: configuration }),
		AuthModule,
		UsersModule,
		DrizzleModule,
		TransactionsModule,
		AccountsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
