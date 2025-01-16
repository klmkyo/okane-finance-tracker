import { Module } from '@nestjs/common'
import { AccountsModule } from 'src/accounts/accounts.module'
import { MoneyboxesController } from './moneyboxes.controller'
import { MoneyboxesService } from './moneyboxes.service'

@Module({
	imports: [AccountsModule],
	controllers: [MoneyboxesController],
	providers: [MoneyboxesService],
	exports: [MoneyboxesService],
})
export class MoneyboxesModule {}
