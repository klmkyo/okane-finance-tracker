'use client'

import { useParams } from 'next/navigation'
import React from 'react'
import { FinanceDashboard } from '../components/FinanceDashboard'

export default function DashboardPage() {
	const params = useParams()
	const accountId = Array.isArray(params.accountId)
		? params.accountId[0]
		: params.accountId

	return (
		<div className="min-h-screen bg-gray-100">
			<FinanceDashboard accountId={Number.parseInt(accountId)} />
		</div>
	)
}
