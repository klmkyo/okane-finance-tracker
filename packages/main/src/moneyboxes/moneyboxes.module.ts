import { Module } from '@nestjs/common'
import { MoneyboxesController } from './moneyboxes.controller'
import { MoneyboxesService } from './moneyboxes.service'

@Module({
	controllers: [MoneyboxesController],
	providers: [MoneyboxesService],
})
export class MoneyboxesModule {}
