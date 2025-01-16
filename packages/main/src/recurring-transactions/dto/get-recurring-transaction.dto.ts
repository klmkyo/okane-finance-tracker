import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional } from 'class-validator'
import { RecurringTransactionInsert } from 'database/schema'
import { TRANSACTION_TYPES } from 'src/common/constants'
import { TransactionType } from 'src/common/types'

export class GetRecurringTransactionDto
	implements Partial<RecurringTransactionInsert>
{
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
