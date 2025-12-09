import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { ApiException, api } from '../api/api'

export interface User {
	id: number
	username: string
	email: string
	firstName: string
	lastName: string
	role: 'USER' | 'ADMIN'
	isBlocked: number
	updatedAt: Date
	createdAt: Date
}

export const useUser = ({ required = false } = {}) => {
	const query = useQuery({
		queryKey: ['user'],
		queryFn: async () => {
			const { data } = await api.get<User>('/users/me')
			return data
		},
		retry: (failureCount, error) => {
			if (error instanceof ApiException && error.statusCode === 401) {
				return false
			}

			return failureCount < 3
		},
	})

	if (required && !query.data) {
		throw new Error('User is not authenticated')
	}

	return useMemo(
		() => ({
			...query,
			user: query.data,
			isAuthenticated: !!query.data,
		}),
		[query],
	)
}
