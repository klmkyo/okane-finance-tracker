'use client'

import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, message } from 'antd'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

interface RegisterFormValues {
	username: string
	email: string
	password: string
	confirmPassword: string
}

export default function RegisterPage() {
	const [form] = Form.useForm()
	const t = useTranslations('Register')

	const onFinish = (values: RegisterFormValues) => {
		console.log('Success:', values)
		message.success(t('registrationSuccess'))
	}

	return (
		<div className="flex justify-center items-center min-h-screen bg-gray-100">
			<Card title={t('title')} className="w-full max-w-md">
				<Form
					form={form}
					name="register"
					onFinish={onFinish}
					layout="vertical"
					scrollToFirstError
				>
					<Form.Item
						name="username"
						rules={[
							{
								required: true,
								message: t('usernameRequired'),
								whitespace: true,
							},
						]}
					>
						<Input prefix={<UserOutlined />} placeholder={t('username')} />
					</Form.Item>
					<Form.Item
						name="email"
						rules={[
							{ type: 'email', message: t('invalidEmail') },
							{ required: true, message: t('emailRequired') },
						]}
					>
						<Input prefix={<MailOutlined />} placeholder={t('email')} />
					</Form.Item>
					<Form.Item
						name="password"
						rules={[
							{ required: true, message: t('passwordRequired') },
							{
								min: 6,
								message: t('passwordMin'),
							},
						]}
						hasFeedback
					>
						<Input.Password
							prefix={<LockOutlined />}
							placeholder={t('password')}
						/>
					</Form.Item>
					<Form.Item
						name="confirmPassword"
						dependencies={['password']}
						hasFeedback
						rules={[
							{ required: true, message: t('confirmPasswordRequired') },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value || getFieldValue('password') === value) {
										return Promise.resolve()
									}
									return Promise.reject(new Error(t('passwordsDoNotMatch')))
								},
							}),
						]}
					>
						<Input.Password
							prefix={<LockOutlined />}
							placeholder={t('confirmPassword')}
						/>
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit" className="w-full">
							{t('registerButton')}
						</Button>
					</Form.Item>
				</Form>
				<div className="text-center mt-4">
					{t('haveAccount')}{' '}
					<Link href="/login" className="text-blue-500 hover:underline">
						{t('loginNow')}
					</Link>
				</div>
			</Card>
		</div>
	)
}
