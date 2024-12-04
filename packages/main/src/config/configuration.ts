import { registerAs } from '@nestjs/config'

const app = () => ({
	databaseUrl: process.env.DATABASE_URL,
})

const auth = registerAs('auth', () => ({
	jwt: {
		secret: process.env.JWT_SECRET,
	},
}))

export const configuration = [app, auth]
