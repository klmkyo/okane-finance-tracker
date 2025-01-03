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

export const configuration = [app, auth, openai]
