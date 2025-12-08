'use client'

import { useUser } from '@/common/hooks/useUser'
import { Button, Result, Spin } from 'antd'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function AdminGuard({ children }: { children: React.ReactNode }) {
	const { user, isLoading } = useUser()
	const t = useTranslations()

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center w-full">
				<Spin />
			</div>
		)
	}

	if (!user || user.role !== 'ADMIN') {
		return (
			<div className="min-h-screen flex items-center justify-center w-full">
				<Result
					status="403"
					title="Forbidden"
					subTitle="You do not have permission to access this page"
					extra={
						<Link href="/dashboard">
							<Button type="primary">Back to Dashboard</Button>
						</Link>
					}
				/>
			</div>
		)
	}

	return <>{children}</>
}
