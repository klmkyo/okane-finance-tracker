import { Type } from 'class-transformer'
import { IsDate, IsInt } from 'class-validator'
import { IsGreaterThanProperty } from 'src/common/greater-than-other-property.validation'

export class ExportTransactionsDto {
	@IsDate()
	@Type(() => Date)
	periodStartDate: Date

	@IsDate()
	@Type(() => Date)
	@IsGreaterThanProperty('periodStartDate')
	periodEndDate: Date

	@Type(() => Number)
	@IsInt()
	accountId: number
}
