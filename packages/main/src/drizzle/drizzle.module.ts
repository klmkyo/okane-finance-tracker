import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { schema } from 'database/schema'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { DB } from 'src/common/constants'

@Global()
@Module({
	providers: [
		{
			provide: DB,
			inject: [ConfigService],
			useFactory: async (config: ConfigService) => {
				const connectionString = config.get<string>('databaseUrl')
				const pool = new Pool({
					connectionString,
				})
				return drizzle(pool, { schema })
			},
		},
	],
	exports: [DB],
})
export class DrizzleModule {}
