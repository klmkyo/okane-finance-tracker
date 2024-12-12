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
	Statistic,
	Table,
	Typography,
} from 'antd'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { SavingsGoalsProgress } from './SavingsGoalsProgress'
import { SpendingCategoryChart } from './SpendingCategoryChart'
import { SpendingHistoryChart } from './SpendingHistoryChart'

const { Title } = Typography

interface Transaction {
	id: number
	date: string
	description: string
	amount: number
	category: string
}

interface FinanceDashboardProps {
	accountId: string
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
	accountId,
}) => {
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [form] = Form.useForm()
	const t = useTranslations('Dashboard')

	const { data: accountData } = useQuery({
		queryKey: ['account', accountId],
		queryFn: async () => {
			// Return mock data
			return {
				totalBalance: 5000,
				monthlyIncome: 3000,
				monthlyExpenses: 2000,
				savingsRate: 33.33,
				// ...existing data...
			}
		},
	})

	const showModal = () => {
		setIsModalVisible(true)
	}

	const handleOk = () => {
		form.validateFields().then((values) => {
			console.log('New transaction:', values)
			// Here you would typically add the new transaction to your state or send it to an API
			form.resetFields()
			setIsModalVisible(false)
		})
	}

	const handleCancel = () => {
		setIsModalVisible(false)
	}

	const columns = [
		{
			title: t('date'),
			dataIndex: 'date',
			key: 'date',
		},
		{
			title: t('description'),
			dataIndex: 'description',
			key: 'description',
		},
		{
			title: t('amount'),
			dataIndex: 'amount',
			key: 'amount',
			render: (amount: number) => `$${amount.toFixed(2)}`,
		},
		{
			title: t('category'),
			dataIndex: 'category',
			key: 'category',
		},
	]

	const recentTransactions: Transaction[] = [
		{
			id: 1,
			date: '2023-06-01',
			description: 'Grocery Shopping',
			amount: 85.5,
			category: 'Food',
		},
		{
			id: 2,
			date: '2023-06-02',
			description: 'Electric Bill',
			amount: 120.0,
			category: 'Utilities',
		},
		{
			id: 3,
			date: '2023-06-03',
			description: 'Movie Tickets',
			amount: 30.0,
			category: 'Entertainment',
		},
	]

	return (
		<div className="min-h-screen bg-gray-100">
			<main className="p-6 max-w-7xl mx-auto">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					<Card>
						<Statistic
							title={t('totalBalance')}
							value={accountData?.totalBalance || 0}
							prefix="$"
							precision={2}
						/>
					</Card>
					<Card>
						<Statistic
							title={t('monthlyIncome')}
							value={accountData?.monthlyIncome || 0}
							prefix="$"
							precision={2}
						/>
					</Card>
					<Card>
						<Statistic
							title={t('monthlyExpenses')}
							value={accountData?.monthlyExpenses || 0}
							prefix="$"
							precision={2}
						/>
					</Card>
					<Card>
						<Statistic
							title={t('savingsRate')}
							value={accountData?.savingsRate || 0}
							suffix="%"
							precision={2}
						/>
					</Card>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
					<Card title={t('spendingHistory')}>
						<SpendingHistoryChart accountId={accountId} />
					</Card>
					<Card title={t('spendingByCategory')}>
						<SpendingCategoryChart accountId={accountId} />
					</Card>
				</div>

				<div className="mt-6">
					<Card title={t('savingsGoalsProgress')}>
						<SavingsGoalsProgress accountId={accountId} />
					</Card>
				</div>

				<div className="mt-6">
					<Card
						title={t('recentTransactions')}
						extra={
							<Button
								type="primary"
								icon={<PlusOutlined />}
								onClick={showModal}
							>
								{t('addTransaction')}
							</Button>
						}
						styles={{
							body: {
								padding: 0,
							},
						}}
					>
						<Table
							columns={columns}
							dataSource={recentTransactions}
							rowKey="id"
							pagination={{ pageSize: 30 }}
						/>
					</Card>
				</div>
			</main>

			<Modal
				title={t('addNewTransaction')}
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={handleCancel}
				okText={t('add')}
				cancelText={t('cancel')}
			>
				<Form form={form} layout="vertical">
					<Form.Item
						name="date"
						label={t('date')}
						rules={[{ required: true, message: t('dateRequired') }]}
					>
						<DatePicker className="w-full" />
					</Form.Item>
					<Form.Item
						name="description"
						label={t('description')}
						rules={[{ required: true, message: t('descriptionRequired') }]}
					>
						<Input placeholder={t('enterDescription')} />
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
						name="category"
						label={t('category')}
						rules={[{ required: true, message: t('categoryRequired') }]}
					>
						<Select placeholder={t('selectCategory')}>
							<Select.Option value="food">{t('food')}</Select.Option>
							<Select.Option value="utilities">{t('utilities')}</Select.Option>
							<Select.Option value="entertainment">
								{t('entertainment')}
							</Select.Option>
							<Select.Option value="other">{t('other')}</Select.Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	)
}
