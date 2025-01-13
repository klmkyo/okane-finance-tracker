'use client'

import { api } from '@/common/api/api'
import { useQuery } from '@tanstack/react-query'
import { Select } from 'antd'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'

interface Account {
	id: number
	createdAt: string
	updatedAt: string
	userId: number
	accountName: string
	balance: number
	currency: string
}

export const useAccounts = () => {
	const query = useQuery({
		queryKey: ['accounts'],
		queryFn: async () => {
			return (await api.get<Account[]>('/accounts')).data
		},
	})

	return {
		accounts: query.data,
		...query,
	}
}

export const AccountSwitcher: React.FC = () => {
	const t = useTranslations('AccountSwitcher')
	const router = useRouter()

	const { accountId } = useParams()

	const { accounts } = useAccounts()

	const handleAccountChange = (value: number) => {
		router.push(`/dashboard/${value}`)
	}

	return (
		<Select
			placeholder={t('selectAccount')}
			onChange={handleAccountChange}
			style={{ width: 200 }}
			value={typeof accountId === 'string' ? Number(accountId) : undefined}
		>
			{accounts?.map((account) => (
				<Select.Option key={account.id} value={account.id}>
					{account.accountName}
				</Select.Option>
			))}
		</Select>
	)
}
