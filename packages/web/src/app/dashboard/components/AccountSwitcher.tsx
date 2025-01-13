'use client'

import { api } from '@/common/api/api'
import { PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Form, Input, Modal, Select } from 'antd'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

interface Account {
	id: number
	createdAt: string
	updatedAt: string
	userId: number
	accountName: string
	balance: number
	currency: string
}

export const AccountSwitcher: React.FC = () => {
	const t = useTranslations('AccountSwitcher')
	const router = useRouter()
	const queryClient = useQueryClient()
	const { data: accounts } = useQuery({
		queryKey: ['accounts'],
		queryFn: async () => {
			return (await api.get<Account[]>('/accounts')).data
		},
	})

	const { mutateAsync: createAccount, isPending } = useMutation({
		mutationFn: async (data: { accountName: string; currency: string }) => {
			await api.post('/accounts', data)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['accounts'] })
		},
	})

	const [isModalVisible, setIsModalVisible] = useState(false)
	const [form] = Form.useForm()

	const handleAccountChange = (value: string) => {
		router.push(`/dashboard/${value}`)
	}

	const showModal = () => {
		setIsModalVisible(true)
	}

	const handleOk = () => {
		form.validateFields().then((values) => {
			createAccount(values).then(() => {
				form.resetFields()
				setIsModalVisible(false)
			})
		})
	}

	const handleCancel = () => {
		setIsModalVisible(false)
	}

	return (
		<>
			<Select
				placeholder={t('selectAccount')}
				onChange={handleAccountChange}
				style={{ width: 200 }}
				dropdownRender={(menu) => (
					<>
						{menu}
						<Button
							type="link"
							icon={<PlusOutlined />}
							onClick={showModal}
							style={{ display: 'flex', alignItems: 'center' }}
						>
							{t('addAccount')}
						</Button>
					</>
				)}
			>
				{accounts?.map((account) => (
					<Select.Option key={account.id} value={account.id}>
						{account.accountName}
					</Select.Option>
				))}
			</Select>

			<Modal
				title={t('addNewAccount')}
				open={isModalVisible}
				onOk={handleOk}
				onCancel={handleCancel}
				loading={isPending}
			>
				<Form form={form} layout="vertical">
					<Form.Item
						name="accountName"
						label={t('accountName')}
						rules={[{ required: true, message: t('accountNameRequired') }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="currency"
						label={t('currency')}
						rules={[{ required: true, message: t('currencyRequired') }]}
					>
						<Select placeholder={t('selectCurrency')}>
							<Select.Option value="USD">USD</Select.Option>
							<Select.Option value="EUR">EUR</Select.Option>
							<Select.Option value="PLN">PLN</Select.Option>
							{/* ...other currencies... */}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</>
	)
}
