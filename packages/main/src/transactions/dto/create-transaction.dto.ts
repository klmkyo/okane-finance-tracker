import { IsIn, IsInt, IsNumber, IsOptional, IsString } from 'class-validator'
import { TransactionInsert } from 'database/schema'
import { TRANSACTION_TYPES } from 'src/common/constants'
import { TransactionType } from 'src/common/types'

export class CreateTransactionDto implements TransactionInsert {
	@IsInt()
	accountId: number

	@IsString()
	title: string

	@IsNumber()
	amount: number

	@IsIn(TRANSACTION_TYPES)
	type: TransactionType

	@IsOptional()
	@IsString()
	description?: string

	@IsOptional()
	@IsInt()
	categoryId?: number
}
