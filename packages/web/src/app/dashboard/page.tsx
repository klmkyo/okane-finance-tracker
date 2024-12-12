'use client'

import React from 'react'
import { AccountSwitcher } from './components/AccountSwitcher'

export default function DashboardIndexPage() {
	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center">
			<AccountSwitcher />
		</div>
	)
}
