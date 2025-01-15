import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		console.log('request:', {
			headers: req.headers,
			body: req.body,
			url: req.originalUrl,
		})

		if (next) {
			next()
		}
	}
}
