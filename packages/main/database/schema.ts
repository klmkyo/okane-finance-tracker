import {
	ExtractTablesWithRelations,
	InferInsertModel,
	InferSelectModel,
} from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import {
	AnyPgColumn,
	customType,
	index,
	integer,
	interval,
	jsonb,
	pgEnum,
	PgQueryResultHKT,
	pgTable,
	PgTableExtraConfigValue,
	PgTransaction,
	serial,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core'

type NumericConfig = {
	precision?: number
	scale?: number
}

export const numericCasted = customType<{
	data: number
	driverData: string
	config: NumericConfig
}>({
	dataType: (config) => {
		if (config?.precision && config?.scale) {
			return `numeric(${config.precision}, ${config.scale})`
		}
		return 'numeric'
	},
	fromDriver: (value: string) => Number.parseFloat(value),
	toDriver: (value: number) => value.toString(),
})

const timestamps = {
	createdAt: timestamp('created_at', {
		mode: 'date',
		precision: 3,
		withTimezone: true,
	})
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updated_at', {
		mode: 'date',
		precision: 3,
		withTimezone: true,
	})
		.defaultNow()
		.notNull()
		.$onUpdateFn(() => new Date()),
}

export const currencyEnum = pgEnum('currency', ['PLN', 'USD', 'EUR'])
export const transactionTypeEnum = pgEnum('transaction_type', [
	'withdraw',
	'deposit',
])

export const User = pgTable(
	'users',
	{
		id: serial('id').primaryKey(),
		username: varchar('username').unique().notNull(),
		password: varchar('password').notNull(),
		email: varchar('email').unique().notNull(),
		firstName: varchar('first_name').notNull(),
		lastName: varchar('last_name'),
		...timestamps,
	},
	(table): PgTableExtraConfigValue[] => [
		index('users_full_name_idx').on(table.lastName, table.firstName),
	],
)
export type UserSelect = InferSelectModel<typeof User>
export type UserInsert = InferInsertModel<typeof User>

export const Account = pgTable(
	'accounts',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => User.id),
		accountName: varchar('account_name').notNull(),
		balance: numericCasted('balance', { precision: 12, scale: 2 })
			.default(0)
			.notNull(),
		currency: currencyEnum('currency').notNull(),
		...timestamps,
	},
	(table): PgTableExtraConfigValue[] => [
		index('accounts_user_id_idx').on(table.userId),
	],
)

export type AccountSelect = InferSelectModel<typeof Account>
export type AccountInsert = InferInsertModel<typeof Account>

export const Moneybox = pgTable(
	'moneyboxes',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => User.id),
		balance: numericCasted('balance', { precision: 12, scale: 2 })
			.default(0)
			.notNull(),
		currency: currencyEnum('currency').notNull(),
		...timestamps,
	},
	(table): PgTableExtraConfigValue[] => [
		index('moneyboxes_user_id_idx').on(table.userId),
	],
)

export type MoneyboxSelect = InferSelectModel<typeof Moneybox>
export type MoneyboxInsert = InferInsertModel<typeof Moneybox>

export const Category = pgTable(
	'categories',
	{
		id: serial('id').primaryKey(),
		// If null, it is a global category
		userId: integer('user_id').references(() => User.id),
		categoryName: varchar('category_name').notNull(),
		parentCategoryId: integer('parent_category_id').references(
			(): AnyPgColumn => Category.id,
		),
		...timestamps,
	},
	(table): PgTableExtraConfigValue[] => [
		index('categories_user_id_idx').on(table.userId),
	],
)

export type CategorySelect = InferSelectModel<typeof Category>
export type CategoryInsert = InferInsertModel<typeof Category>

export const Transaction = pgTable(
	'transactions',
	{
		id: serial('id').primaryKey(),
		title: varchar('title').notNull(),
		description: varchar('description'),
		amount: numericCasted('amount', { precision: 12, scale: 2 }).notNull(),
		type: transactionTypeEnum('type').notNull(),
		accountId: integer('account_id')
			.notNull()
			.references(() => Account.id),
		categoryId: integer('category_id').references(() => Category.id),
		...timestamps,
	},
	(table): PgTableExtraConfigValue[] => [
		index('transactions_account_id_category_id_idx').on(
			table.accountId,
			table.categoryId,
		),
		index('transactions_account_id_type_idx').on(table.accountId, table.type),
		index('transactions_account_id_created_at_idx').on(
			table.accountId,
			table.createdAt,
		),
	],
)

export type TransactionSelect = InferSelectModel<typeof Transaction>
export type TransactionInsert = InferInsertModel<typeof Transaction>

export const RecurringTransaction = pgTable(
	'recurring_transactions',
	{
		id: serial('id').primaryKey(),
		startDate: timestamp('start_date').notNull(),
		endDate: timestamp('end_date'),
		interval: interval('interval').notNull(),
		title: varchar('title').notNull(),
		description: varchar('description'),
		amount: numericCasted('amount', { precision: 12, scale: 2 }).notNull(),
		type: transactionTypeEnum('type').notNull(),
		accountId: integer('account_id')
			.notNull()
			.references(() => Account.id),
		categoryId: integer('category_id').references(() => Category.id),
		...timestamps,
	},
	(table): PgTableExtraConfigValue[] => [
		index('recurring_transactions_account_id_category_id_idx').on(
			table.accountId,
			table.categoryId,
		),
		index('recurring_transactions_account_id_type_idx').on(
			table.accountId,
			table.type,
		),
		index('recurring_transactions_account_id_created_at_idx').on(
			table.accountId,
			table.createdAt,
		),
	],
)

export type RecurringTransactionSelect = InferSelectModel<
	typeof RecurringTransaction
>
export type RecurringTransactionInsert = InferInsertModel<
	typeof RecurringTransaction
>

export const SavingGoal = pgTable(
	'saving_goals',
	{
		id: serial('id').primaryKey(),
		moneyboxId: integer('moneybox_id')
			.notNull()
			.references(() => Moneybox.id),
		userId: integer('user_id')
			.notNull()
			.references(() => User.id),
		targetAmount: numericCasted('target_amount', {
			precision: 12,
			scale: 2,
		}).notNull(),
		title: varchar('title').notNull(),
		description: varchar('description'),
		...timestamps,
	},
	(table): PgTableExtraConfigValue[] => [
		index('saving_goals_user_id_idx').on(table.userId),
		index('saving_goals_moneybox_id_idx').on(table.moneyboxId),
	],
)

export type SavingGoalSelect = InferSelectModel<typeof SavingGoal>
export type SavingGoalInsert = InferInsertModel<typeof SavingGoal>

export const AiChatConversation = pgTable(
	'ai_chat_conversations',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => User.id),
		conversationLog: jsonb('conversation_log').notNull(),
		...timestamps,
	},
	(table): PgTableExtraConfigValue[] => [
		index('ai_chat_conversations_user_id_idx').on(table.userId),
	],
)

export type AiChatConversationSelect = InferSelectModel<
	typeof AiChatConversation
>
export type AiChatConversationInsert = InferInsertModel<
	typeof AiChatConversation
>

export const AiRaport = pgTable(
	'ai_raports',
	{
		id: serial('id').primaryKey(),
		periodStartDate: timestamp('period_start_date').notNull(),
		periodEndDate: timestamp('period_end_date').notNull(),
		reviewedData: varchar('reviewed_data'),
		accountId: integer('account_id')
			.notNull()
			.references(() => Account.id),
		...timestamps,
	},
	(table): PgTableExtraConfigValue[] => [
		index('ai_raports_account_id_idx').on(table.accountId),
	],
)

export type AiRaportSelect = InferSelectModel<typeof AiRaport>
export type AiRaportInsert = InferInsertModel<typeof AiRaport>

export const schema = {
	User,
	Account,
	Moneybox,
	Transaction,
	RecurringTransaction,
	SavingGoal,
	Category,
	AiChatConversation,
	AiRaport,
}

export type Database = NodePgDatabase<typeof schema>
export type DatabaseTransaction = PgTransaction<
	PgQueryResultHKT,
	typeof schema,
	ExtractTablesWithRelations<typeof schema>
>
