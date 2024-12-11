'use client'

import { useUser } from '@/common/hooks/useUser'
import { Button, Spin } from 'antd'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function AuthGuard({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading } = useUser()
	const t = useTranslations()

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center w-full">
				<Spin />
			</div>
		)
	}

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center w-full flex-col gap-4">
				<h1 className="font-semibold tracking-wide text-lg">
					{t('DashboardLayout.notAuthenticated')}
				</h1>
				<Link href="/login">
					<Button type="primary" size="large">
						{t('DashboardLayout.login')}
					</Button>
				</Link>
			</div>
		)
	}

	return <>{children}</>
}
