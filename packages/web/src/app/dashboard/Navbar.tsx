'use client'

import { LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu } from 'antd'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo } from 'react'

const user = {
	name: 'Jan Kowalski',
	email: 'jan@example.com',
	avatar: '/avatar.png',
}

const Navbar: React.FC = () => {
	const t = useTranslations('Navbar')

	const items = useMemo(
		() => [
			{
				key: 'settings',
				icon: <SettingOutlined />,
				label: t('settings'),
			},
			{
				key: 'logout',
				icon: <LogoutOutlined />,
				label: t('logout'),
			},
		],
		[t],
	)

	return (
		<nav className="sticky top-0 z-50 bg-white shadow">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex-shrink-0 flex items-center">
						<Link href="/" className="text-xl font-bold text-blue-600">
							Okane
						</Link>
					</div>

					<div className="flex items-center">
						<div className="text-right mr-4 hidden sm:block">
							<p className="text-sm font-medium text-gray-700">{user.name}</p>
							<p className="text-xs text-gray-500">{user.email}</p>
						</div>

						<Dropdown
							menu={{
								items,
							}}
							placement="bottomRight"
							trigger={['click']}
						>
							<Button type="text" className="flex items-center size-10 p-0">
								<Image
									className="size-10 rounded-full"
									width={40}
									height={40}
									src={user.avatar}
									alt={user.name}
								/>
							</Button>
						</Dropdown>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default Navbar
