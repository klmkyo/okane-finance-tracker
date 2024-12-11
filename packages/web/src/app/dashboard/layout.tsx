'use client'

import { AuthGuard } from '@/common/authGuard'
import React from 'react'
import Navbar from './Navbar'

export default function DashboardLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<AuthGuard>
			<Navbar />
			<main className="flex-grow bg-gray-100">{children}</main>
		</AuthGuard>
	)
}
