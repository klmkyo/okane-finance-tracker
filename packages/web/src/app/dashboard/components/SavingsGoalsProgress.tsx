'use client'
import { useQuery } from '@tanstack/react-query'
import { Progress } from 'antd'
import { useTranslations } from 'next-intl'
import React from 'react'

export const SavingsGoalsProgress: React.FC<{ accountId: string }> = ({
	accountId,
}) => {
	const t = useTranslations('SavingsGoalsProgress')
	const { data: goals } = useQuery({
		queryKey: ['savingsGoals', accountId],
		queryFn: async () => {
			// Return mock data
			return [
				{ name: t('emergencyFund'), current: 5000, target: 10000 },
				{ name: t('vacation'), current: 2000, target: 5000 },
				{ name: t('newCar'), current: 15000, target: 30000 },
			]
		},
	})

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{goals?.map((goal) => (
				<div key={goal.name} className="p-4 bg-white rounded shadow">
					<h4 className="mb-2 text-lg font-semibold">{goal.name}</h4>
					<Progress
						percent={Math.round((goal.current / goal.target) * 100)}
						format={() => `$${goal.current} / $${goal.target}`}
						status="active"
					/>
				</div>
			))}
		</div>
	)
}
