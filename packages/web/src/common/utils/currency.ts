import { ECurrency } from '@/common/types/currency'

const CURRENCY_FORMATTERS: Record<ECurrency, Intl.NumberFormat> = {
	USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
	EUR: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }),
	PLN: new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }),
}

type StringifiedEnum<T extends string> = T | `${T}`

const CURRENCY_SYMBOLS: Record<ECurrency, string> = {
	USD: '$',
	EUR: '€',
	PLN: 'zł',
}

export const formatCurrency = (
	amount: number,
	currency: StringifiedEnum<ECurrency>,
): string => {
	console.log({ amount, currency })
	return CURRENCY_FORMATTERS[currency].format(amount)
}
