import { currencyEnum, transactionTypeEnum } from 'database/schema'

export const DB = 'DB'
export const SUCCESS = { success: true }

export const TRANSACTION_TYPES = transactionTypeEnum.enumValues
export const CURRENCIES = currencyEnum.enumValues
