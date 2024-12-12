'use client'

import { PlusOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import {
	Button,
	Card,
	DatePicker,
	Form,
	Input,
	InputNumber,
	Modal,
	Select,
	Table,
} from 'antd'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

export const RecurringTransactions: React.FC<{ accountId: string }> = ({
	accountId,
}) => {
	const t = useTranslations('RecurringTransactions')
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [form] = Form.useForm()

	const { data: recurringTransactions } = useQuery({
		queryKey: ['recurringTransactions', accountId],
		queryFn: async () => {
			// Return mock data
			return [
				{
					id: 1,
					title: 'Monthly Rent',
					amount: 1000,
					interval: 'Monthly',
					nextDate: '2023-07-01',
				},
				// ...existing data...
			]
		},
	})

	const columns = [
		{ title: t('title'), dataIndex: 'title', key: 'title' },
		{
			title: t('amount'),
			dataIndex: 'amount',
			key: 'amount',
			render: (amount: number) => `$${amount}`,
		},
		{ title: t('interval'), dataIndex: 'interval', key: 'interval' },
		{ title: t('nextDate'), dataIndex: 'nextDate', key: 'nextDate' },
	]

	const showModal = () => {
		setIsModalVisible(true)
	}

	const handleOk = () => {
		form.validateFields().then((values) => {
			// Handle adding new recurring transaction
			form.resetFields()
			setIsModalVisible(false)
		})
	}

	const handleCancel = () => {
		setIsModalVisible(false)
	}

	return (
		<Card
			title={t('recurringTransactions')}
			extra={
				<Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
					{t('addRecurringTransaction')}
				</Button>
			}
		>
			<Table columns={columns} dataSource={recurringTransactions} rowKey="id" />
			<Modal
				title={t('addNewRecurringTransaction')}
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={handleCancel}
			>
				<Form form={form} layout="vertical">
					<Form.Item
						name="title"
						label={t('title')}
						rules={[{ required: true, message: t('titleRequired') }]}
					>
						<Input placeholder={t('enterTitle')} />
					</Form.Item>
					<Form.Item
						name="amount"
						label={t('amount')}
						rules={[{ required: true, message: t('amountRequired') }]}
					>
						<InputNumber
							prefix="$"
							className="w-full"
							min={0}
							placeholder={t('enterAmount')}
						/>
					</Form.Item>
					<Form.Item
						name="interval"
						label={t('interval')}
						rules={[{ required: true, message: t('intervalRequired') }]}
					>
						<Select placeholder={t('selectInterval')}>
							<Select.Option value="Daily">{t('daily')}</Select.Option>
							<Select.Option value="Weekly">{t('weekly')}</Select.Option>
							<Select.Option value="Monthly">{t('monthly')}</Select.Option>
							<Select.Option value="Yearly">{t('yearly')}</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item
						name="startDate"
						label={t('startDate')}
						rules={[{ required: true, message: t('startDateRequired') }]}
					>
						<DatePicker className="w-full" />
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	)
}
