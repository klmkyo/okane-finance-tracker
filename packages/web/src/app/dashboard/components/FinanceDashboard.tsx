'use client'

import { api } from '@/common/api/api'
import { TransactionType } from '@/common/types/transaction'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
	Tree,
	Typography,
	message,
} from 'antd'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import React, { useMemo, useState } from 'react'
import { SavingsGoalsProgress } from './SavingsGoalsProgress'
import { SpendingCategoryChart } from './SpendingCategoryChart'
import { SpendingHistoryChart } from './SpendingHistoryChart'

const { Title } = Typography

export interface Transaction {
	accountId: number
	title: string
	amount: number
	date: string
	type: TransactionType
	description?: string
	categoryId?: number
	createdAt: string
	updatedAt: string
	categoryName?: string
}

export interface Account {
	id: number
	createdAt: string
	updatedAt: string
	userId: number
	accountName: string
	balance: number
}

interface FinanceDashboardProps {
	accountId: string
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
	accountId,
}) => {
	const [isModalVisible, setIsModalVisible] = useState(false)
	const t = useTranslations('Dashboard')

	const { data: accountData } = useQuery({
		queryKey: ['account', accountId],
		queryFn: async () => {
			return (await api.get<Account>(`/accounts/${accountId}`)).data
		},
	})

	const { data: recentTransactions } = useQuery({
		queryKey: ['transactions', accountId],
		queryFn: async () => {
			return (
				await api.get<Transaction[]>(`/transactions?accountId=${accountId}`)
			).data
		},
	})

	const showModal = () => {
		setIsModalVisible(true)
	}

	const columns = [
		{
			title: t('date'),
			dataIndex: 'date',
			key: 'date',
			render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
		},
		{
			title: t('title'),
			dataIndex: 'title',
			key: 'title',
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
			dataIndex: 'categoryName',
			key: 'categoryName',
			render: (categoryName: string) =>
				categoryName || <span className="opacity-50">-</span>,
		},
	]

	const monthlyIncome = useMemo(() => {
		return (
			recentTransactions?.reduce((acc, transaction) => {
				if (transaction.type === TransactionType.DEPOSIT) {
					return acc + transaction.amount
				}
				return acc
			}, 0) || 0
		)
	}, [recentTransactions])

	const monthlyExpense = useMemo(() => {
		return (
			recentTransactions?.reduce((acc, transaction) => {
				if (transaction.type === TransactionType.WITHDRAWAL) {
					return acc + transaction.amount
				}
				return acc
			}, 0) || 0
		)
	}, [recentTransactions])

	const savingsRate = useMemo(() => {
		if (!monthlyIncome) return 0
		return ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100
	}, [monthlyIncome, monthlyExpense])

	return (
		<div className="min-h-screen bg-gray-100">
			<main className="p-6 max-w-7xl mx-auto">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					<Card>
						<Statistic
							title={t('totalBalance')}
							value={accountData?.balance || 0}
							prefix="$"
							precision={2}
						/>
					</Card>
					<Card>
						<Statistic
							title={t('monthlyIncome')}
							value={monthlyIncome || 0}
							prefix="$"
							precision={2}
						/>
					</Card>
					<Card>
						<Statistic
							title={t('monthlyExpenses')}
							value={monthlyExpense || 0}
							prefix="$"
							precision={2}
						/>
					</Card>
					<Card>
						<Statistic
							title={t('savingsRate')}
							value={savingsRate || 0}
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

			{accountData && (
				<TransactionModal
					visible={isModalVisible}
					setVisible={setIsModalVisible}
					account={accountData}
				/>
			)}
		</div>
	)
}

interface TransactionModalProps {
	visible: boolean
	setVisible: (visible: boolean) => void
	account: Account
}

const TransactionModal: React.FC<TransactionModalProps> = ({
	visible,
	setVisible,
	account,
}) => {
	const [form] = Form.useForm()
	const t = useTranslations('Dashboard')
	const queryClient = useQueryClient()
	const [categoryModalVisible, setCategoryModalVisible] = useState(false)
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(
		null,
	)

	const { id: accountId } = account

	const { mutateAsync: createTransaction } = useMutation({
		mutationFn: async (data: Omit<Transaction, 'createdAt' | 'updatedAt'>) => {
			return api.post('/transactions', data)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['account', accountId] })
			queryClient.invalidateQueries({ queryKey: ['transactions', accountId] })
		},
	})

	const handleOk = () => {
		form.validateFields().then((values) => {
			createTransaction({
				...values,
				accountId,
				categoryId: selectedCategory?.id, // ensure we pass the chosen category
			}).then(() => {
				form.resetFields()
				setSelectedCategory(null)
				setVisible(false)
			})
		})
	}

	const handleCancel = () => {
		setVisible(false)
	}

	return (
		<Modal
			title={t('addNewTransaction')}
			open={visible}
			onOk={handleOk}
			onCancel={handleCancel}
			okText={t('add')}
			cancelText={t('cancel')}
		>
			<Form
				form={form}
				layout="vertical"
				initialValues={{ type: TransactionType.DEPOSIT, date: dayjs() }}
			>
				<Form.Item
					name="title"
					label={t('placeholder')}
					rules={[{ required: true, message: t('titleRequired') }]}
				>
					<Input placeholder={t('enterTitle')} />
				</Form.Item>
				<Form.Item
					name="type"
					label={t('type')}
					rules={[{ required: true, message: t('typeRequired') }]}
				>
					<Select>
						<Select.Option value={TransactionType.DEPOSIT}>
							{t('deposit')}
						</Select.Option>
						<Select.Option value={TransactionType.WITHDRAWAL}>
							{t('withdrawal')}
						</Select.Option>
					</Select>
				</Form.Item>
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
					rules={[{ message: t('descriptionRequired') }]}
				>
					<Input placeholder={t('enterDescription')} />
				</Form.Item>
				<Form.Item
					name="amount"
					label={t('amount')}
					rules={[{ required: true, message: t('amountRequired') }]}
					style={{ width: '100%' }}
				>
					<InputNumber
						prefix="$"
						style={{ width: '100%' }}
						min={0}
						placeholder={t('enterAmount')}
					/>
				</Form.Item>
				<Form.Item label={t('category')}>
					<Input
						value={selectedCategory?.categoryName || t('selectCategory')}
						readOnly
						onClick={() => setCategoryModalVisible(true)}
						className="cursor-pointer"
					/>
				</Form.Item>
			</Form>

			<CategoryModal
				visible={categoryModalVisible}
				setVisible={setCategoryModalVisible}
				onSelectCategory={(cat) => {
					setSelectedCategory(cat)
					setCategoryModalVisible(false)
				}}
			/>
		</Modal>
	)
}

export interface Category {
	id: number
	userId: null | number
	categoryName: string
	parentCategoryId: null | number
	createdAt: string
	updatedAt: string
	subcategories: Category[]
}

interface CategoryModalProps {
	visible: boolean
	setVisible: (visible: boolean) => void
	onSelectCategory: (cat: Category) => void
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
	visible,
	setVisible,
	onSelectCategory,
}) => {
	const t = useTranslations('Dashboard')
	const queryClient = useQueryClient()
	const [searchTerm, setSearchTerm] = useState('')

	// const { data: categories } = useQuery({
	// 	queryKey: ['categories'],
	// 	queryFn: async () => {
	// 		return (await api.get<Category[]>('/categories')).data
	// 	},
	// })

	const { categories } = useCategories()

	const { mutateAsync: createCategory } = useMutation({
		mutationFn: async (newCategory: {
			categoryName: string
			parentCategoryId?: number
		}) => {
			return (await api.post('/categories', newCategory)).data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['categories'] })
			message.success('Category created')
		},
	})

	const { mutateAsync: updateCategory } = useMutation({
		mutationFn: async ({
			categoryId,
			updated,
		}: {
			categoryId: number
			updated: { categoryName?: string; parentCategoryId?: number }
		}) => {
			return (await api.patch(`/categories/${categoryId}`, updated)).data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['categories'] })
			message.success('Category updated')
		},
	})

	const { mutateAsync: deleteCategoryMutation } = useMutation({
		mutationFn: async (categoryId: number) => {
			return (await api.delete(`/categories/${categoryId}`)).data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['categories'] })
			message.success('Category deleted')
		},
	})

	const filterCategories = (cats: Category[]): Category[] => {
		const term = searchTerm.toLowerCase()
		return cats
			.filter((cat) => {
				const nameMatch = cat.categoryName.toLowerCase().includes(term)
				const childMatch = cat.subcategories?.some((sub) =>
					sub.categoryName.toLowerCase().includes(term),
				)
				return nameMatch || childMatch
			})
			.map((cat) => ({
				...cat,
				subcategories: filterCategories(cat.subcategories || []),
			}))
	}

	const buildTreeData = (cats: Category[]): any[] => {
		return cats.map((cat) => {
			const isEditable = cat.userId !== null

			return {
				title: (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
						}}
					>
						<span>{cat.categoryName}</span>
						<span>
							<Button
								type="text"
								icon={<PlusOutlined />}
								onClick={(e) => {
									e.stopPropagation()
									const subName = prompt('New subcategory name?')
									if (subName) {
										createCategory({
											categoryName: subName,
											parentCategoryId: cat.id,
										})
									}
								}}
								onMouseDown={(e) => e.preventDefault()}
							/>
							{isEditable && (
								<>
									<Button
										type="text"
										icon={<EditOutlined />}
										onClick={(e) => {
											e.stopPropagation()
											const newName = prompt(
												'Enter a new name for this category:',
												cat.categoryName,
											)
											if (newName && newName !== cat.categoryName) {
												updateCategory({
													categoryId: cat.id,
													updated: { categoryName: newName },
												})
											}
										}}
										onMouseDown={(e) => e.preventDefault()}
									/>
									<Button
										type="text"
										danger
										icon={<DeleteOutlined />}
										onClick={(e) => {
											e.stopPropagation()
											if (
												window.confirm(
													`Are you sure you want to delete "${cat.categoryName}"?`,
												)
											) {
												deleteCategoryMutation(cat.id)
											}
										}}
										onMouseDown={(e) => e.preventDefault()}
									/>
								</>
							)}
						</span>
					</div>
				),
				key: cat.id,
				category: cat,
				children: buildTreeData(cat.subcategories || []),
			}
		})
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: Optimization
	const displayedCategories = useMemo(() => {
		if (!categories) return []
		if (!searchTerm) return buildTreeData(categories)
		const filtered = filterCategories(categories)
		return buildTreeData(filtered)
	}, [categories, searchTerm])

	const onSelect = (_selectedKeys: any, info: any) => {
		onSelectCategory(info.node.category)
	}

	return (
		<Modal
			title="Select Category"
			open={visible}
			onCancel={() => setVisible(false)}
			footer={null}
		>
			<Input.Search
				placeholder="Search categories"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				style={{ marginBottom: 8 }}
			/>
			<Tree
				treeData={displayedCategories}
				onSelect={onSelect}
				defaultExpandAll
				style={{ maxHeight: 400, overflowY: 'auto' }}
				showLine={{ showLeafIcon: false }}
			/>
		</Modal>
	)
}

export const useCategories = () => {
	const { data: categories, ...props } = useQuery({
		queryKey: ['categories'],
		queryFn: async () => {
			return (await api.get<Category[]>('/categories')).data
		},
	})

	return { ...props, categories }
}
