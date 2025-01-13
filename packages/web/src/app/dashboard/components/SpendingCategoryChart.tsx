'use client'

import { useQuery } from '@tanstack/react-query'
import { Radio } from 'antd'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from 'recharts'

const COLORS = [
	'#0088FE',
	'#00C49F',
	'#FFBB28',
	'#FF8042',
	'#AA336A',
	'#33AA99',
]

type TimeRange = 'week' | 'month' | 'year' | 'tenYears'

export const SpendingCategoryChart: React.FC<{ accountId: number }> = ({
	accountId,
}) => {
	const [timeRange, setTimeRange] = useState<TimeRange>('week')
	const t = useTranslations('SpendingCategoryChart')

	const { data } = useQuery({
		queryKey: ['spendingCategories', accountId],
		queryFn: async () => {
			// Return mock data
			return {
				week: [
					{ category: 'Food', value: 300 },
					{ category: 'Utilities', value: 200 },
					{ category: 'Entertainment', value: 150 },
					{ category: 'Other', value: 100 },
				],
				month: [
					{ category: 'Food', value: 1200 },
					{ category: 'Utilities', value: 800 },
					{ category: 'Entertainment', value: 600 },
					{ category: 'Other', value: 400 },
				],
				year: [
					{ category: 'Food', value: 14400 },
					{ category: 'Utilities', value: 9600 },
					{ category: 'Entertainment', value: 7200 },
					{ category: 'Other', value: 4800 },
				],
				tenYears: [
					{ category: 'Food', value: 144000 },
					{ category: 'Utilities', value: 96000 },
					{ category: 'Entertainment', value: 72000 },
					{ category: 'Other', value: 48000 },
				],
			}
		},
	})

	const chartData = data ? data[timeRange] : []

	return (
		<div className="bg-white p-4 rounded">
			<div className="flex justify-center mb-4">
				<Radio.Group
					value={timeRange}
					onChange={(e) => setTimeRange(e.target.value as TimeRange)}
					className="space-x-2"
				>
					<Radio.Button value="week">{t('week')}</Radio.Button>
					<Radio.Button value="month">{t('month')}</Radio.Button>
					<Radio.Button value="year">{t('year')}</Radio.Button>
					<Radio.Button value="tenYears">{t('tenYears')}</Radio.Button>
				</Radio.Group>
			</div>
			<ResponsiveContainer width="100%" height={400}>
				<PieChart>
					<Pie
						data={chartData}
						dataKey="value"
						nameKey="category"
						cx="50%"
						cy="50%"
						outerRadius={150}
						fill="#8884d8"
						label={({ category, percent }) =>
							`${category} ${(percent * 100).toFixed(0)}%`
						}
					>
						{chartData.map((entry, index) => (
							<Cell
								key={`cell-${index}`}
								fill={COLORS[index % COLORS.length]}
							/>
						))}
					</Pie>
					<Tooltip formatter={(value: number) => `$${value}`} />
					<Legend />
				</PieChart>
			</ResponsiveContainer>
		</div>
	)
}
