import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { UserSelect } from 'database/schema'

export const UserId = createParamDecorator(
	(data: unknown, ctx: ExecutionContext): UserSelect['id'] => {
		const request = ctx.switchToHttp().getRequest()
		console.log(request)
		return request.user.id
	},
)
