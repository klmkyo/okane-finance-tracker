import { Module } from '@nestjs/common';
import { SavingGoalsService } from './saving-goals.service';
import { SavingGoalsController } from './saving-goals.controller';

@Module({
  controllers: [SavingGoalsController],
  providers: [SavingGoalsService],
})
export class SavingGoalsModule {}
