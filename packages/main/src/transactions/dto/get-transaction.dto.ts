import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional } from 'class-validator'
import { TransactionInsert } from 'database/schema'
import { TRANSACTION_TYPES } from 'src/common/constants'
import { TransactionType } from 'src/common/types'

export class GetTransactionDto implements Partial<TransactionInsert> {
	@Type(() => Number)
	@IsInt()
	accountId: number

	@Type(() => Number)
	@IsInt()
	@IsOptional()
	categoryId?: number

	@IsIn(TRANSACTION_TYPES)
	@IsOptional()
	type?: TransactionType
}
