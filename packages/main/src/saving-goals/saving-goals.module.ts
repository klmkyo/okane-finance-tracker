import { Module } from '@nestjs/common'
import { SavingGoalsController } from './saving-goals.controller'
import { SavingGoalsService } from './saving-goals.service'

@Module({
	controllers: [SavingGoalsController],
	providers: [SavingGoalsService],
})
export class SavingGoalsModule {}
