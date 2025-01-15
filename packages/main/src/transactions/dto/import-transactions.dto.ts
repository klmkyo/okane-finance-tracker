import { IsInt } from 'class-validator'

export class ImportTransactionsDto {
	@IsInt()
	accountId: number
}
