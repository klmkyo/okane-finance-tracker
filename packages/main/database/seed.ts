import { faker } from '@faker-js/faker'
import * as bcrypt from 'bcrypt'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { createHash } from 'node:crypto'

import * as dotenv from 'dotenv'

const seededRandomBool = (seed: string, probability: number) => {
	const digest = createHash('sha256').update(seed).digest('hex')
	const value = Number.parseInt(digest.slice(0, 12), 16)
	return value / 2 ** 48 < probability
}

dotenv.config()

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
})

const db = drizzle({ client: pool })

const ROW_COUNT = 10000

faker.seed(123)

function randomElement(arr) {
	return arr[Math.floor(Math.random() * arr.length)]
}

function formatDate(date) {
	return date.toISOString()
}

console.log('Generating data in memory...')

const users = []
const usedUsernames = new Set()
const usedEmails = new Set()

const unencryptedPasswordPool = ['password1', 'password2', 'password3']

const encryptedPasswordPool = unencryptedPasswordPool.map((password) =>
	bcrypt.hashSync(password, 10),
)

// Add test users first
const testUsers = [
	{
		username: 'admin',
		password: bcrypt.hashSync('admin123', 10),
		email: 'admin@example.com',
		firstName: 'Admin',
		lastName: 'User',
		role: 'ADMIN',
		isBlocked: 0,
	},
	{
		username: 'user',
		password: bcrypt.hashSync('user123', 10),
		email: 'user@example.com',
		firstName: 'John',
		lastName: 'Doe',
		role: 'USER',
		isBlocked: 0,
	},
	{
		username: 'blocked_user',
		password: bcrypt.hashSync('blocked123', 10),
		email: 'blocked@example.com',
		firstName: 'Jane',
		lastName: 'Blocked',
		role: 'USER',
		isBlocked: 1,
	},
]

const now = formatDate(new Date())
const pastDate = formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))

for (const testUser of testUsers) {
	const user = {
		id: users.length + 1,
		username: testUser.username,
		password: testUser.password,
		email: testUser.email,
		first_name: testUser.firstName,
		last_name: testUser.lastName,
		role: testUser.role,
		is_blocked: testUser.isBlocked,
		created_at: pastDate,
		updated_at: now,
	}
	users.push(user)
	usedUsernames.add(testUser.username)
	usedEmails.add(testUser.email)
}

for (let i = 0; i < ROW_COUNT; i++) {
	let username: string
	do {
		username = faker.internet.username().toLowerCase()
	} while (usedUsernames.has(username))
	usedUsernames.add(username)

	let email: string
	do {
		email = faker.internet.email().toLowerCase()
	} while (usedEmails.has(email))
	usedEmails.add(email)

	const hashedPassword =
		encryptedPasswordPool[
			Math.floor(Math.random() * encryptedPasswordPool.length)
		]

	const user = {
		id: users.length + 1,
		username,
		password: hashedPassword,
		email: email,
		first_name: faker.person.firstName(),
		last_name: faker.person.lastName(),
		role: 'USER',
		is_blocked: 0,
		created_at: formatDate(faker.date.past()),
		updated_at: formatDate(new Date()),
	}
	users.push(user)
}

const accounts = []
const currencies = ['PLN', 'USD', 'EUR']
for (let i = 0; i < ROW_COUNT; i++) {
	const account = {
		id: i + 1,
		user_id: faker.number.int({ min: 1, max: ROW_COUNT }),
		account_name: faker.finance.accountName(),
		balance: faker.finance.amount({ min: 0, max: 100000, dec: 2 }),
		currency: randomElement(currencies),
		created_at: formatDate(faker.date.past()),
		updated_at: formatDate(new Date()),
	}
	accounts.push(account)
}

const ai_chat_conversations = []
for (let i = 0; i < ROW_COUNT; i++) {
	const conversationLog = {
		messages: [
			{ role: 'user', content: faker.lorem.sentence() },
			{ role: 'assistant', content: faker.lorem.sentence() },
		],
	}
	const convo = {
		id: i + 1,
		user_id: faker.number.int({ min: 1, max: ROW_COUNT }),
		conversation_log: JSON.stringify(conversationLog),
		created_at: formatDate(faker.date.recent()),
		updated_at: formatDate(new Date()),
	}
	ai_chat_conversations.push(convo)
}

const ai_raports = []
for (let i = 0; i < ROW_COUNT; i++) {
	const startDate = faker.date.past()
	const endDate = new Date(
		startDate.getTime() +
			faker.number.int({ min: 1, max: 10 }) * 24 * 60 * 60 * 1000,
	)
	const raport = {
		id: i + 1,
		period_start_date: formatDate(startDate),
		period_end_date: formatDate(endDate),
		review_response: {
			test: faker.lorem.sentence(),
		},
		account_id: faker.number.int({ min: 1, max: ROW_COUNT }),
		created_at: formatDate(startDate),
		updated_at: formatDate(new Date()),
	}
	ai_raports.push(raport)
}

const categories = []
for (let i = 0; i < ROW_COUNT; i++) {
	let parent_category_id = null
	if (i >= ROW_COUNT / 2) {
		parent_category_id = faker.number.int({ min: 1, max: ROW_COUNT / 2 })
	}

	const isPrivate = seededRandomBool(i.toString(), 0.8)

	const category = {
		id: i + 1,
		user_id: isPrivate ? faker.number.int({ min: 1, max: ROW_COUNT }) : null,
		category_name: faker.commerce.department(),
		parent_category_id,
		created_at: formatDate(faker.date.past()),
		updated_at: formatDate(new Date()),
	}
	categories.push(category)
}

const moneyboxes = []
for (let i = 0; i < ROW_COUNT; i++) {
	const box = {
		id: i + 1,
		user_id: faker.number.int({ min: 1, max: ROW_COUNT }),
		balance: faker.finance.amount({ min: 0, max: 50000, dec: 2 }),
		currency: randomElement(currencies),
		created_at: formatDate(faker.date.past()),
		updated_at: formatDate(new Date()),
	}
	moneyboxes.push(box)
}

const transaction_types = ['withdraw', 'deposit']
const recurring_transactions = []
for (let i = 0; i < ROW_COUNT; i++) {
	const startDate = faker.date.past()
	const maybeEnd = Math.random() > 0.5 ? faker.date.future() : null
	const rec_tran = {
		id: i + 1,
		start_date: formatDate(startDate),
		end_date: maybeEnd ? formatDate(maybeEnd) : null,
		interval: '1 month',
		title: faker.lorem.words(2),
		description: faker.lorem.sentence(),
		amount: faker.finance.amount({ min: 10, max: 1000, dec: 2 }),
		type: randomElement(transaction_types),
		account_id: faker.number.int({ min: 1, max: ROW_COUNT }),
		category_id: faker.number.int({ min: 1, max: ROW_COUNT }),
		created_at: formatDate(startDate),
		updated_at: formatDate(new Date()),
	}
	recurring_transactions.push(rec_tran)
}

const saving_goals = []
for (let i = 0; i < ROW_COUNT; i++) {
	const sg = {
		id: i + 1,
		moneybox_id: faker.number.int({ min: 1, max: ROW_COUNT }),
		user_id: faker.number.int({ min: 1, max: ROW_COUNT }),
		target_amount: faker.finance.amount({ min: 100, max: 50000, dec: 2 }),
		title: faker.lorem.words(3),
		description: faker.lorem.sentence(),
		created_at: formatDate(faker.date.past()),
		updated_at: formatDate(new Date()),
	}
	saving_goals.push(sg)
}

const transactions = []
for (let i = 0; i < ROW_COUNT; i++) {
	const trDate = faker.date.past()
	const tr = {
		id: i + 1,
		title: faker.commerce.productName(),
		description: faker.lorem.sentence(),
		amount: faker.finance.amount({ min: 1, max: 5000, dec: 2 }),
		type: randomElement(transaction_types),
		account_id: faker.number.int({ min: 1, max: ROW_COUNT }),
		category_id: faker.number.int({ min: 1, max: ROW_COUNT }),
		created_at: formatDate(trDate),
		updated_at: formatDate(new Date()),
		date: formatDate(trDate),
	}
	transactions.push(tr)
}

console.log('Generating SQL inserts...')

let sql = ''

function batchInsert(tableName, columns, rows) {
	const colList = columns.map((c) => `"${c}"`).join(', ')
	const valuesList = rows
		.map((r) => {
			return `(${columns
				.map((c) => {
					const val = r[c]
					if (val === null || val === undefined) {
						return 'NULL'
					}

					if (typeof val === 'object') {
						return `'${JSON.stringify(val).replace(/'/g, "''")}'`
					}

					if (typeof val === 'number' || val.match(/^\d+(\.\d+)?$/)) {
						return val
					}

					return `'${val.replace(/'/g, "''")}'`
				})
				.join(', ')})`
		})
		.join(',\n')
	return `INSERT INTO "${tableName}" (${colList}) VALUES\n${valuesList};\n\n`
}

sql += batchInsert(
	'users',
	[
		'id',
		'username',
		'password',
		'email',
		'first_name',
		'last_name',
		'role',
		'is_blocked',
		'created_at',
		'updated_at',
	],
	users,
)

sql += batchInsert(
	'accounts',
	[
		'id',
		'user_id',
		'account_name',
		'balance',
		'currency',
		'created_at',
		'updated_at',
	],
	accounts,
)

sql += batchInsert(
	'ai_chat_conversations',
	['id', 'user_id', 'conversation_log', 'created_at', 'updated_at'],
	ai_chat_conversations,
)

sql += batchInsert(
	'ai_raports',
	[
		'id',
		'period_start_date',
		'period_end_date',
		'review_response',
		'account_id',
		'created_at',
		'updated_at',
	],
	ai_raports,
)

sql += batchInsert(
	'categories',
	[
		'id',
		'user_id',
		'category_name',
		'parent_category_id',
		'created_at',
		'updated_at',
	],
	categories,
)

sql += batchInsert(
	'moneyboxes',
	['id', 'user_id', 'balance', 'currency', 'created_at', 'updated_at'],
	moneyboxes,
)

sql += batchInsert(
	'recurring_transactions',
	[
		'id',
		'start_date',
		'end_date',
		'interval',
		'title',
		'description',
		'amount',
		'type',
		'account_id',
		'category_id',
		'created_at',
		'updated_at',
	],
	recurring_transactions,
)

sql += batchInsert(
	'saving_goals',
	[
		'id',
		'moneybox_id',
		'user_id',
		'target_amount',
		'title',
		'description',
		'created_at',
		'updated_at',
	],
	saving_goals,
)

sql += batchInsert(
	'transactions',
	[
		'id',
		'title',
		'description',
		'amount',
		'type',
		'account_id',
		'category_id',
		'created_at',
		'updated_at',
		'date',
	],
	transactions,
)
;(async () => {
	await db.execute(sql)

	await db.execute(`
		SELECT setval(pg_get_serial_sequence('"users"', 'id'), COALESCE((SELECT MAX(id)+1 FROM "users"), 1), false);
		SELECT setval(pg_get_serial_sequence('"accounts"', 'id'), COALESCE((SELECT MAX(id)+1 FROM "accounts"), 1), false);
		SELECT setval(pg_get_serial_sequence('"ai_chat_conversations"', 'id'), COALESCE((SELECT MAX(id)+1 FROM "ai_chat_conversations"), 1), false);
		SELECT setval(pg_get_serial_sequence('"ai_raports"', 'id'), COALESCE((SELECT MAX(id)+1 FROM "ai_raports"), 1), false);
		SELECT setval(pg_get_serial_sequence('"categories"', 'id'), COALESCE((SELECT MAX(id)+1 FROM "categories"), 1), false);
		SELECT setval(pg_get_serial_sequence('"moneyboxes"', 'id'), COALESCE((SELECT MAX(id)+1 FROM "moneyboxes"), 1), false);
		SELECT setval(pg_get_serial_sequence('"recurring_transactions"', 'id'), COALESCE((SELECT MAX(id)+1 FROM "recurring_transactions"), 1), false);
		SELECT setval(pg_get_serial_sequence('"saving_goals"', 'id'), COALESCE((SELECT MAX(id)+1 FROM "saving_goals"), 1), false);
		SELECT setval(pg_get_serial_sequence('"transactions"', 'id'), COALESCE((SELECT MAX(id)+1 FROM "transactions"), 1), false);
`)
})()
