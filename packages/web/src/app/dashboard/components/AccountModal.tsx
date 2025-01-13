'use client'

import { api } from '@/common/api/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Form, Input, Modal, Select } from 'antd'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import React from 'react'
import { Account } from './FinanceDashboard'

export function AccountModal({
	open,
	onClose,
}: {
	open: boolean
	onClose: () => void
}) {
	const t = useTranslations('AccountSwitcher')
	const router = useRouter()
	const queryClient = useQueryClient()
	const { mutateAsync: createAccount, isPending } = useMutation({
		mutationFn: async (data: { accountName: string; currency: string }) =>
			(await api.post<Account>('/accounts', data)).data,
		onSuccess: (account) => {
			queryClient.invalidateQueries({ queryKey: ['accounts'] })
			router.push(`/dashboard/${account.id}`)
		},
	})
	const [form] = Form.useForm()

	const handleOk = () => {
		form.validateFields().then((values) => {
			createAccount(values).then(() => {
				form.resetFields()
				onClose()
			})
		})
	}

	return (
		<Modal
			title={t('addNewAccount')}
			open={open}
			onOk={handleOk}
			onCancel={onClose}
			confirmLoading={isPending}
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
					</Select>
				</Form.Item>
			</Form>
		</Modal>
	)
}
