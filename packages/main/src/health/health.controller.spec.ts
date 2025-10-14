import { Test, type TestingModule } from '@nestjs/testing'
import { HealthController } from './health.controller'
import { HealthService } from './health.service'

describe('HealthController', () => {
	let controller: HealthController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [HealthController],
			providers: [HealthService],
		}).compile()

		controller = module.get<HealthController>(HealthController)
	})

	it('should report ok status with timestamp and uptime', () => {
		const result = controller.getHealth()
		expect(result.status).toBe('ok')
		expect(typeof result.timestamp).toBe('number')
		expect(typeof result.uptime).toBe('number')
	})
})
