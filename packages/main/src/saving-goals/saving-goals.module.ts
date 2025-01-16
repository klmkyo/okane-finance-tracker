import { Module } from '@nestjs/common'
import { AccountsModule } from 'src/accounts/accounts.module'
import { SavingGoalsController } from './saving-goals.controller'
import { SavingGoalsService } from './saving-goals.service'

@Module({
	imports: [AccountsModule],
	controllers: [SavingGoalsController],
	providers: [SavingGoalsService],
})
export class SavingGoalsModule {}
