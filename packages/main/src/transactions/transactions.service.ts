import {
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { Account, Category, Database, Transaction } from 'database/schema'
import { and, eq, getTableColumns, gte, lte, sql } from 'drizzle-orm'
import * as csv from 'fast-csv'
import { AccountsService } from 'src/accounts/accounts.service'
import { CategoriesService } from 'src/categories/categories.service'
import { assert } from 'src/common/assert'
import { DB, SUCCESS } from 'src/common/constants'
import { TransactionType } from 'src/common/types'
import { Readable } from 'stream'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { UpdateTransactionDto } from './dto/update-transaction.dto'
import { TransactionCsvRow } from './transactions.types'

@Injectable()
export class TransactionsService {
	constructor(
		@Inject(DB) private db: Database,
		private accountsService: AccountsService,
		private categoriesService: CategoriesService,
	) {}

	async create(userId: number, data: CreateTransactionDto) {
		const isUserAccount = await this.accountsService.isUserAccount(
			userId,
			data.accountId,
		)

		assert(isUserAccount, 'not_your_account', ForbiddenException)

		await this.accountsService.updateBalance(
			data.type,
			data.accountId,
			data.amount,
		)
		return await this.db.insert(Transaction).values(data).returning()
	}

	async generateCsv(userId: number, accountId: number, start: Date, end: Date) {
		const data = await this.db
			.select({
				date: sql<string>`transactions.created_at::timestamptz`,
				type: Transaction.type,
				amount: Transaction.amount,
				category: Category.categoryName,
				title: Transaction.title,
				description: Transaction.description,
			})
			.from(Transaction)
			.leftJoin(Category, eq(Category.id, Transaction.categoryId))
			.where(
				and(
					eq(Transaction.accountId, accountId),
					gte(Transaction.createdAt, start),
					lte(Transaction.createdAt, end),
				),
			)
		console.log(data)

		const createCsvBuffer = (data) => {
			const readStream = Readable.from(data)
			const buffers = []

			return new Promise((resolve, reject) => {
				const csvStream = csv
					.format({ headers: true })
					.on('data', (chunk) => buffers.push(chunk))
					.on('end', () => resolve(Buffer.concat(buffers)))
					.on('error', reject)

				readStream.pipe(csvStream)
			})
		}

		return await createCsvBuffer(data)
	}

	async importTransactions(
		userId: number,
		accountId: number,
		file: Express.Multer.File,
	) {
		const stream = Readable.from(file.buffer)
		csv
			.parseStream(stream, { headers: true })
			.on('data', async (row: TransactionCsvRow) => {
				const insert = await transformValues(row)
				await this.create(userId, insert)
			})

		const transformValues = async (row: TransactionCsvRow) => {
			return {
				date: new Date(row.date),
				type: row.type as TransactionType,
				amount: Number(row.amount),
				categoryId: row.category
					? await this._upsertCategoryByName(userId, row.category)
					: null,
				title: row.title,
				description: row.description,
				accountId,
			}
		}
	}

	// should not be here :(
	private async _upsertCategoryByName(userId: number, categoryName: string) {
		let categoryId: number
		const [dbCategory] = await this.categoriesService.findByName(
			userId,
			categoryName,
		)

		categoryId = dbCategory?.id

		if (!categoryId) {
			const [dbCategory] = await this.categoriesService.create(userId, {
				categoryName,
			})
			categoryId = dbCategory.id
		}
		return categoryId
	}

	async find(
		userId: number,
		accountId: number,
		categoryId?: number,
		type?: TransactionType,
	) {
		const transactions = await this.db
			.select({
				...getTableColumns(Transaction),
				categoryName: Category.categoryName,
			})
			.from(Transaction)
			.leftJoin(Account, eq(Account.id, Transaction.accountId))
			.leftJoin(Category, eq(Category.id, Transaction.categoryId))
			.where(
				and(
					categoryId && eq(Transaction.categoryId, categoryId),
					type && eq(Transaction.type, type),
					eq(Transaction.accountId, accountId),
					eq(Account.userId, userId),
				),
			)

		return transactions
	}

	async patch(
		userId: number,
		transactionId: number,
		data: UpdateTransactionDto,
	) {
		const getAccount = this.db
			.select()
			.from(Account)
			.where(eq(Account.id, data.accountId))

		const getTx = await this.db
			.select()
			.from(Transaction)
			.leftJoin(Account, eq(Account.id, Transaction.accountId))
			.where(and(eq(Account.userId, userId), eq(Transaction.id, transactionId)))

		// dirty
		const [[account], [tx]] = await Promise.all([getAccount, getTx])

		assert(
			!data.accountId || account?.userId === userId,
			'not_your_account',
			ForbiddenException,
		)
		assert(tx, 'not_found', NotFoundException)

		return await this.db
			.update(Transaction)
			.set(data)
			.where(eq(Transaction.id, transactionId))
			.returning()
	}

	async delete(userId: number, transactionId: number) {
		const [tx] = await this.db
			.select()
			.from(Transaction)
			.leftJoin(Account, eq(Account.id, Transaction.accountId))
			.where(and(eq(Account.userId, userId), eq(Transaction.id, transactionId)))

		assert(tx, 'not_found', NotFoundException)
		await this.db.delete(Transaction).where(eq(Transaction.id, transactionId))

		return SUCCESS
	}
}
