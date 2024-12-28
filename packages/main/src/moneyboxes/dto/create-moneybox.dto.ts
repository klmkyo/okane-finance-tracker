import { IsIn, IsNumber, IsOptional } from 'class-validator'
import { CURRENCIES } from 'src/common/constants'
import { Currency } from 'src/common/types'

export class CreateMoneyboxDto {
	@IsIn(CURRENCIES)
	currency: Currency

	@IsOptional()
	@IsNumber()
	balance: number
}
