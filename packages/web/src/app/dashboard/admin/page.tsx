'use client'

import { api } from '@/common/api/api'
import { useUser } from '@/common/hooks/useUser'
import { Button, Space, Table, Tag, message, Popconfirm, Spin, Empty, Card, Input, Select, Row, Col, Statistic, Result } from 'antd'
import { SearchOutlined, ClearOutlined, TeamOutlined, LockOutlined, CrownOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'

interface User {
	id: number
	username: string
	email: string
	firstName: string
	lastName: string
	role: 'USER' | 'ADMIN'
	isBlocked: number
	createdAt: string
	updatedAt: string
}

export default function AdminPage() {
	const queryClient = useQueryClient()
	const { user: currentUser } = useUser()

	// Filter state
	const [searchTerm, setSearchTerm] = useState('')
	const [roleFilter, setRoleFilter] = useState<string | null>(null)
	const [statusFilter, setStatusFilter] = useState<string | null>(null)
	const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('ascend')

	const { data: users = [], isLoading } = useQuery({
		queryKey: ['admin-users'],
		queryFn: async () => {
			const { data } = await api.get<User[]>('/admin/users')
			return data
		},
	})

	// Filter and sort users
	const filteredUsers = useMemo(() => {
		let result = [...users]

		// Search filter
		if (searchTerm) {
			const term = searchTerm.toLowerCase()
			result = result.filter(
				(user) =>
					user.username.toLowerCase().includes(term) ||
					user.email.toLowerCase().includes(term) ||
					user.firstName.toLowerCase().includes(term) ||
					user.lastName?.toLowerCase().includes(term)
			)
		}

		// Role filter
		if (roleFilter) {
			result = result.filter((user) => user.role === roleFilter)
		}

		// Status filter
		if (statusFilter === 'blocked') {
			result = result.filter((user) => user.isBlocked)
		} else if (statusFilter === 'active') {
			result = result.filter((user) => !user.isBlocked)
		}

		// Sort by ID
		result.sort((a, b) => {
			return sortOrder === 'ascend' ? a.id - b.id : b.id - a.id
		})

		return result
	}, [users, searchTerm, roleFilter, statusFilter, sortOrder])

	// Statistics
	const stats = useMemo(() => {
		return {
			total: users.length,
			admins: users.filter((u) => u.role === 'ADMIN').length,
			blocked: users.filter((u) => u.isBlocked).length,
		}
	}, [users])

	const blockMutation = useMutation({
		mutationFn: async (userId: number) => {
			await api.post(`/admin/users/${userId}/block`)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-users'] })
			message.success('User blocked successfully')
		},
		onError: () => {
			message.error('Failed to block user')
		},
	})

	const unblockMutation = useMutation({
		mutationFn: async (userId: number) => {
			await api.post(`/admin/users/${userId}/unblock`)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-users'] })
			message.success('User unblocked successfully')
		},
		onError: () => {
			message.error('Failed to unblock user')
		},
	})

	const promoteToAdminMutation = useMutation({
		mutationFn: async (userId: number) => {
			await api.post(`/admin/users/${userId}/promote`)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-users'] })
			message.success('User promoted to admin')
		},
		onError: () => {
			message.error('Failed to promote user')
		},
	})

	const demoteFromAdminMutation = useMutation({
		mutationFn: async (userId: number) => {
			await api.post(`/admin/users/${userId}/demote`)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-users'] })
			message.success('User demoted from admin')
		},
		onError: () => {
			message.error('Failed to demote user')
		},
	})

	const deleteUserMutation = useMutation({
		mutationFn: async (userId: number) => {
			await api.delete(`/admin/users/${userId}`)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-users'] })
			message.success('User deleted successfully')
		},
		onError: () => {
			message.error('Failed to delete user')
		},
	})

	const columns = [
		{
			title: 'ID',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			sorter: false,
			render: (id: number) => <span className="font-semibold">{id}</span>,
		},
		{
			title: 'Username',
			dataIndex: 'username',
			key: 'username',
			width: 120,
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			width: 160,
		},
		{
			title: 'Name',
			key: 'name',
			width: 140,
			render: (_: any, record: User) => `${record.firstName} ${record.lastName || ''}`,
		},
		{
			title: 'Role',
			dataIndex: 'role',
			key: 'role',
			width: 100,
			render: (role: string) => (
				<Tag icon={role === 'ADMIN' ? <CrownOutlined /> : undefined} color={role === 'ADMIN' ? 'gold' : 'blue'}>
					{role}
				</Tag>
			),
		},
		{
			title: 'Status',
			key: 'status',
			width: 100,
			render: (_: any, record: User) => (
				<Tag icon={record.isBlocked ? <LockOutlined /> : undefined} color={record.isBlocked ? 'red' : 'green'}>
					{record.isBlocked ? 'Blocked' : 'Active'}
				</Tag>
			),
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 300,
			render: (_: any, record: User) => {
				const isCurrentUser = record.id === currentUser?.id
				return (
					<Space size="small" wrap>
						{record.isBlocked ? (
							<Button
								size="small"
								type="primary"
								onClick={() => unblockMutation.mutate(record.id)}
								loading={unblockMutation.isPending}
							>
								Unblock
							</Button>
						) : (
							<Popconfirm
								title="Block user?"
								description="This will prevent the user from logging in"
								onConfirm={() => blockMutation.mutate(record.id)}
								okText="Yes"
								cancelText="No"
							>
								<Button
									size="small"
									danger
									loading={blockMutation.isPending}
									disabled={isCurrentUser}
								>
									Block
								</Button>
							</Popconfirm>
						)}

						{record.role === 'ADMIN' ? (
							<Button
								size="small"
								onClick={() => demoteFromAdminMutation.mutate(record.id)}
								loading={demoteFromAdminMutation.isPending}
								disabled={isCurrentUser}
							>
								Demote
							</Button>
						) : (
							<Button
								size="small"
								onClick={() => promoteToAdminMutation.mutate(record.id)}
								loading={promoteToAdminMutation.isPending}
							>
								Promote
							</Button>
						)}

						<Popconfirm
							title="Delete user?"
							description="This action cannot be undone"
							onConfirm={() => deleteUserMutation.mutate(record.id)}
							okText="Yes"
							cancelText="No"
						>
							<Button
								size="small"
								danger
								loading={deleteUserMutation.isPending}
								disabled={isCurrentUser}
							>
								Delete
							</Button>
						</Popconfirm>
					</Space>
				)
			},
		},
	]

	// Check if user is admin
	if (!currentUser || currentUser.role !== 'ADMIN') {
		return (
			<Result
				status="403"
				title="Forbidden"
				subTitle="You do not have permission to access the admin panel"
			/>
		)
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<Spin />
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Statistics Cards */}
			<Row gutter={16}>
				<Col xs={24} sm={8}>
					<Card>
						<Statistic
							title="Total Users"
							value={stats.total}
							prefix={<TeamOutlined />}
							valueStyle={{ color: '#1890ff' }}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={8}>
					<Card>
						<Statistic
							title="Admins"
							value={stats.admins}
							prefix={<CrownOutlined />}
							valueStyle={{ color: '#faad14' }}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={8}>
					<Card>
						<Statistic
							title="Blocked Users"
							value={stats.blocked}
							prefix={<LockOutlined />}
							valueStyle={{ color: '#f5222d' }}
						/>
					</Card>
				</Col>
			</Row>

			{/* Filter Card */}
			<Card title="Filters & Search" className="shadow-sm">
				<Row gutter={[16, 16]}>
					<Col xs={24} sm={12} md={6}>
						<Input
							prefix={<SearchOutlined />}
							placeholder="Search by name, email..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							allowClear
						/>
					</Col>
					<Col xs={24} sm={12} md={6}>
						<Select
							placeholder="Filter by role"
							value={roleFilter}
							onChange={setRoleFilter}
							allowClear
							options={[
								{ label: 'Admin', value: 'ADMIN' },
								{ label: 'User', value: 'USER' },
							]}
						/>
					</Col>
					<Col xs={24} sm={12} md={6}>
						<Select
							placeholder="Filter by status"
							value={statusFilter}
							onChange={setStatusFilter}
							allowClear
							options={[
								{ label: 'Active', value: 'active' },
								{ label: 'Blocked', value: 'blocked' },
							]}
						/>
					</Col>
					<Col xs={24} sm={12} md={6}>
						<Select
							placeholder="Sort by ID"
							value={sortOrder}
							onChange={setSortOrder}
							options={[
								{ label: 'Ascending', value: 'ascend' },
								{ label: 'Descending', value: 'descend' },
							]}
						/>
					</Col>
				</Row>
				<Row className="mt-4">
					<Button
						icon={<ClearOutlined />}
						onClick={() => {
							setSearchTerm('')
							setRoleFilter(null)
							setStatusFilter(null)
							setSortOrder('ascend')
						}}
					>
						Clear Filters
					</Button>
				</Row>
			</Card>

			{/* Users Table */}
			<Card title={`User Management (${filteredUsers.length} users)`} className="shadow-sm">
				{filteredUsers.length === 0 ? (
					<Empty description="No users found" />
				) : (
					<Table
						columns={columns}
						dataSource={filteredUsers}
						rowKey="id"
						pagination={{ pageSize: 20, showSizeChanger: true }}
						scroll={{ x: 1000 }}
						size="middle"
					/>
				)}
			</Card>
		</div>
	)
}
