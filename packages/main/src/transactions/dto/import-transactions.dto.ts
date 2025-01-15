import { Type } from 'class-transformer'
import { IsInt } from 'class-validator'

export class ImportTransactionsDto {
	@Type(() => Number)
	@IsInt()
	accountId: number
}
