import { Module } from '@nestjs/common';
import { MoneyboxesService } from './moneyboxes.service';
import { MoneyboxesController } from './moneyboxes.controller';

@Module({
  controllers: [MoneyboxesController],
  providers: [MoneyboxesService],
})
export class MoneyboxesModule {}
