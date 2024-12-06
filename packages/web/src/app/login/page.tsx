'use client'

import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, message } from 'antd'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

interface LoginFormValues {
	username: string
	password: string
}

export default function LoginPage() {
	const [form] = Form.useForm()
	const t = useTranslations('Login')

	const onFinish = (values: LoginFormValues) => {
		console.log('Success:', values)
		message.success(t('loginSuccess'))
	}

	return (
		<div className="flex justify-center items-center min-h-screen bg-gray-100">
			<Card title={t('title')} className="w-full max-w-md">
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
						<Button type="primary" htmlType="submit" className="w-full">
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
