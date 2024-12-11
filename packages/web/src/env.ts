import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
	server: {},
	client: {
		NEXT_PUBLIC_API_URL: z
			.string()
			.url()
			.refine((url) => !url.endsWith('/'), {
				message: 'API_URL should not end with a slash',
			}),
	},
	// For Next.js >= 13.4.4, you only need to destructure client variables:
	experimental__runtimeEnv: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	},
})
