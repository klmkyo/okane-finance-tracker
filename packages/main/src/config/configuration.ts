import { registerAs } from '@nestjs/config'

const app = () => ({
	databaseUrl: process.env.DATABASE_URL,
})

const auth = registerAs('auth', () => ({
	jwt: {
		secret: process.env.JWT_SECRET,
	},
}))

const openai = registerAs('openai', () => ({
	apiKey: process.env.OPENAI_API_KEY,
}))

const queue = registerAs('queue', () => ({
	url: process.env.REDIS_URL ?? 'redis://localhost:6379',
}))

export const configuration = [app, auth, openai, queue]
