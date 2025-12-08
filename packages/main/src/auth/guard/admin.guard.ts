import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class AdminGuard implements CanActivate {
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest()
		const user = request.user

		if (!user || user.role !== 'ADMIN') {
			throw new ForbiddenException('Only administrators can access this resource')
		}

		return true
	}
}
