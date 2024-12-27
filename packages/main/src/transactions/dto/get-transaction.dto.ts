import { IsIn, IsInt, IsOptional } from 'class-validator'
import { TransactionInsert } from 'database/schema'
import { TRANSACTION_TYPES } from 'src/common/constants'
import { TransactionType } from 'src/common/types'

export class GetTransactionDto implements Partial<TransactionInsert> {
	@IsInt()
	accountId: number

	@IsInt()
	@IsOptional()
	categoryId?: number

	@IsIn(TRANSACTION_TYPES)
	@IsOptional()
	type?: TransactionType
}
