import { BullModule } from '@nestjs/bullmq'
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AccountsModule } from './accounts/accounts.module'
import { AdminModule } from './admin/admin.module'
import { AiChatModule } from './ai-chat/ai-chat.module'
import { AiRaportModule } from './ai-raport/ai-raport.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { CategoriesModule } from './categories/categories.module'
import { RequestLoggerMiddleware } from './common/request-logger.middleware'
import { configuration } from './config/configuration'
import { DrizzleModule } from './drizzle/drizzle.module'
import { HealthModule } from './health/health.module'
import { MoneyboxesModule } from './moneyboxes/moneyboxes.module'
import { RecurringTransactionsModule } from './recurring-transactions/recurring-transactions.module'
import { SavingGoalsModule } from './saving-goals/saving-goals.module'
import { TransactionsModule } from './transactions/transactions.module'
import { UsersModule } from './users/users.module'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, load: configuration }),
		AuthModule,
		UsersModule,
		AdminModule,
		DrizzleModule,
		TransactionsModule,
		RecurringTransactionsModule,
		AccountsModule,
		MoneyboxesModule,
		SavingGoalsModule,
		CategoriesModule,
		AiChatModule,
		AiRaportModule,
		HealthModule,
		BullModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				connection: {
					url: configService.get<string>('queue.url', 'redis://localhost:6379'),
				},
			}),
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(RequestLoggerMiddleware)
			.forRoutes({ path: '*', method: RequestMethod.ALL })
	}
}
