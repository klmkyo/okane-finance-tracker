import { CURRENCIES, TRANSACTION_TYPES } from './constants'

export type TransactionType = (typeof TRANSACTION_TYPES)[number]
export type Currency = (typeof CURRENCIES)[number]
