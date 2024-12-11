import {
	ExtractTablesWithRelations,
	InferInsertModel,
	InferSelectModel,
} from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import {
	PgQueryResultHKT,
	pgTable,
	PgTransaction,
	serial,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core'

export const User = pgTable('users', {
	id: serial().primaryKey(),
	username: varchar().unique().notNull(),
	email: varchar().unique().notNull(),
	firstName: varchar().notNull(),
	lastName: varchar(),
	password: varchar().notNull(),
	updatedAt: timestamp(),
	createdAt: timestamp().defaultNow().notNull(),
})

export type UserSelect = InferSelectModel<typeof User>
export type UserInsert = InferInsertModel<typeof User>

export const schema = {
	User,
}

export type Database = NodePgDatabase<typeof schema>
export type DatabaseTransaction = PgTransaction<
	PgQueryResultHKT,
	typeof schema,
	ExtractTablesWithRelations<typeof schema>
>
