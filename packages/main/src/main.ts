import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	app.use(cookieParser())
	app.useGlobalPipes(
		new ValidationPipe({
			always: true,
			transform: true,
		}),
	)

	app.enableCors({
		origin: '*',
		methods: 'GET,POST,PUT,DELETE,OPTIONS',
		allowedHeaders: 'X-Requested-With, Content-Type, Authorization',
	})

	await app.listen(process.env.PORT ?? 4321)
}
bootstrap()
