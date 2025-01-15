import { Module } from '@nestjs/common'
import { AccountsModule } from 'src/accounts/accounts.module'
import { CategoriesModule } from 'src/categories/categories.module'
import { TransactionsController } from './transactions.controller'
import { TransactionsService } from './transactions.service'

@Module({
	imports: [AccountsModule, CategoriesModule],
	controllers: [TransactionsController],
	providers: [TransactionsService],
})
export class TransactionsModule {}
