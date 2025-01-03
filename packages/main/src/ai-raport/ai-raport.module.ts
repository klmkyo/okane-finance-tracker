import { Module } from '@nestjs/common'
import { AccountsModule } from 'src/accounts/accounts.module'
import { AiRaportController } from './ai-raport.controller'
import { AiRaportService } from './ai-raport.service'

@Module({
	imports: [AccountsModule],
	controllers: [AiRaportController],
	providers: [AiRaportService],
})
export class AiRaportModule {}
