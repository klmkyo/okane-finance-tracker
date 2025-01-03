import { Type } from 'class-transformer'
import { IsDate, IsInt } from 'class-validator'
import { AiRaportInsert } from 'database/schema'
import { IsGreaterThanProperty } from 'src/common/greater-than-other-property.validation'

export class GenerateRaportDto implements AiRaportInsert {
	@IsDate()
	@Type(() => Date)
	// @MinDate(() => new Date())
	periodStartDate: Date

	@IsDate()
	@Type(() => Date)
	@IsGreaterThanProperty('periodStartDate')
	periodEndDate: Date

	@IsInt()
	accountId: number
}
