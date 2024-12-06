'use client'
import { Line } from '@ant-design/plots'
import { Radio } from 'antd'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

export const SpendingHistoryChart: React.FC = () => {
	const [timeRange, setTimeRange] = useState<
		'week' | 'month' | 'year' | 'tenYears'
	>('week')
	const t = useTranslations('SpendingHistoryChart')

	const data = {
		week: [
			{ date: '2023-06-01', amount: 100 },
			{ date: '2023-06-02', amount: 150 },
			{ date: '2023-06-03', amount: 80 },
			{ date: '2023-06-04', amount: 200 },
			{ date: '2023-06-05', amount: 120 },
			{ date: '2023-06-06', amount: 90 },
			{ date: '2023-06-07', amount: 180 },
		],
		month: [
			{ date: '2023-06-01', amount: 400 },
			{ date: '2023-06-05', amount: 600 },
			{ date: '2023-06-10', amount: 800 },
			{ date: '2023-06-15', amount: 700 },
			{ date: '2023-06-20', amount: 900 },
			{ date: '2023-06-25', amount: 500 },
			{ date: '2023-06-30', amount: 1000 },
		],
		year: [
			{ date: '2023-01', amount: 3000 },
			{ date: '2023-04', amount: 4500 },
			{ date: '2023-07', amount: 4000 },
			{ date: '2023-10', amount: 5500 },
		],
		tenYears: [
			{ date: '2014', amount: 20000 },
			{ date: '2016', amount: 25000 },
			{ date: '2018', amount: 30000 },
			{ date: '2020', amount: 35000 },
			{ date: '2022', amount: 40000 },
			{ date: '2024', amount: 45000 },
		],
	}

	const config = {
		data: data[timeRange],
		xField: 'date',
		yField: 'amount',
		point: {
			size: 5,
			shape: 'diamond',
		},
		tooltip: {
			formatter: (data: any) => ({
				name: t('amount'),
				value: `$${data.amount}`,
			}),
		},
	}

	return (
		<div className="bg-white p-4 rounded">
			<div className="flex justify-center mb-4">
				<Radio.Group
					value={timeRange}
					onChange={(e) => setTimeRange(e.target.value)}
					className="space-x-2"
				>
					<Radio.Button value="week">{t('week')}</Radio.Button>
					<Radio.Button value="month">{t('month')}</Radio.Button>
					<Radio.Button value="year">{t('year')}</Radio.Button>
					<Radio.Button value="tenYears">{t('tenYears')}</Radio.Button>
				</Radio.Group>
			</div>
			<Line {...config} />
		</div>
	)
}
