'use client'

import { api } from '@/common/api/api'
import { useAuthToken } from '@/common/hooks/useAuthToken'
import { useUser } from '@/common/hooks/useUser'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Card, Form, Input, message } from 'antd'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffectOnceWhen } from 'rooks'

interface LoginFormValues {
	username: string
	password: string
}

interface LoginResponse {
	token: string
}

export default function LoginPage() {
	const t = useTranslations('Login')
	const router = useRouter()
	const queryClient = useQueryClient()
	const { isAuthenticated, isFetched } = useUser()

	const mutation = useMutation({
		mutationFn: async (values: LoginFormValues) => {
			return (await api.post<LoginResponse>('/auth/login', values)).data
		},
		onSuccess: async ({ token }) => {
			setToken(token)
			await queryClient.invalidateQueries()
			message.success(t('loginSuccess'))
			form.resetFields()
			router.push('/dashboard')
		},
		onError: (error) => {
			message.error(t('loginFailed', { reason: error.message }))
		},
	})

	useEffectOnceWhen(() => {
		if (isAuthenticated) {
			router.push('/dashboard')
			message.info(t('alreadyLoggedIn'))
		}
	}, isFetched)

	const [form] = Form.useForm()

	const [, setToken] = useAuthToken()

	const onFinish = (values: LoginFormValues) => {
		mutation.mutate(values)
	}

	return (
		<div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
			<Card title={t('title')} className="w-full max-w-md drop-shadow">
				<Form
					form={form}
					name="login"
					initialValues={{ remember: true }}
					onFinish={onFinish}
					layout="vertical"
				>
					<Form.Item
						name="username"
						rules={[{ required: true, message: t('usernameRequired') }]}
					>
						<Input prefix={<UserOutlined />} placeholder={t('username')} />
					</Form.Item>
					<Form.Item
						name="password"
						rules={[{ required: true, message: t('passwordRequired') }]}
					>
						<Input.Password
							prefix={<LockOutlined />}
							placeholder={t('password')}
						/>
					</Form.Item>
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							className="w-full"
							loading={mutation.isPending}
						>
							{t('loginButton')}
						</Button>
					</Form.Item>
				</Form>
				<div className="text-center mt-4">
					{t('noAccount')}{' '}
					<Link href="/register" className="text-blue-500 hover:underline">
						{t('registerNow')}
					</Link>
				</div>
			</Card>
		</div>
	)
}
