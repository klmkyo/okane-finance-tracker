import { Type } from 'class-transformer'
import {
	IsDate,
	IsIn,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	MinDate,
} from 'class-validator'
import { RecurringTransactionInsert } from 'database/schema'
import { TRANSACTION_TYPES } from 'src/common/constants'
import { IsGreaterThanProperty } from 'src/common/greater-than-other-property.validation'
import { IsPostgresInterval } from 'src/common/postgres-interval.validation'
import { TransactionType } from 'src/common/types'

export class CreateRecurringTransactionDto
	implements RecurringTransactionInsert
{
	@IsInt()
	accountId: number

	@IsString()
	title: string

	@IsNumber()
	amount: number

	@IsIn(TRANSACTION_TYPES)
	type: TransactionType

	@IsDate()
	@Type(() => Date)
	@MinDate(() => new Date())
	startDate: Date

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	@IsGreaterThanProperty('startDate')
	endDate?: Date

	@IsString()
	@IsPostgresInterval()
	interval: string

	@IsOptional()
	@IsString()
	description?: string

	@IsOptional()
	@IsInt()
	categoryId?: number
}
