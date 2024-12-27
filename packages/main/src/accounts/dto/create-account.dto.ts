import { IsIn, IsString } from 'class-validator'
import { CURRENCIES } from 'src/common/constants'
import { Currency } from 'src/common/types'

export class CreateAccountDto {
	@IsString()
	accountName: string

	@IsIn(CURRENCIES)
	currency: Currency
}
