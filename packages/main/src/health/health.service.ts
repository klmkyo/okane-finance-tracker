import { Injectable } from '@nestjs/common'

@Injectable()
export class HealthService {
	check() {
		return {
			status: 'ok',
			uptime: process.uptime(),
			timestamp: Date.now(),
		}
	}
}
