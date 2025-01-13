'use client'

import { PlusOutlined } from '@ant-design/icons'
import { Button, Typography } from 'antd'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { AccountModal } from './components/AccountModal'
import { useAccounts } from './components/AccountSwitcher'

export default function DashboardIndexPage() {
	const router = useRouter()

	const [isModalVisible, setIsModalVisible] = useState(false)
	const t = useTranslations('DashboardIndexPage')

	const { accounts } = useAccounts()

	useEffect(() => {
		if (accounts?.length) {
			router.push(`/dashboard/${accounts[0].id}`)
		}
	}, [accounts, router])

	return (
		<div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-black">
			<Typography.Title level={2}>{t('noAccountsTitle')}</Typography.Title>
			<Typography.Text className="mb-5">
				{t('noAccountsDescription')}
			</Typography.Text>

			<Button
				type="primary"
				onClick={() => setIsModalVisible(true)}
				icon={<PlusOutlined />}
			>
				{t('openAccountButton')}
			</Button>
			<AccountModal
				open={isModalVisible}
				onClose={() => setIsModalVisible(false)}
			/>
		</div>
	)
}
