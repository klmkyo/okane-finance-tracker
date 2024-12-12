import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
	private appService:AppService
	constructor(appService: AppService) {
		this.appService=appService
	}

	@Get()
	getHello(): string {
		return this.appService.getHello()
	}
}
