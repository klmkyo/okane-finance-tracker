'use client'
import { useEffect } from 'react'
import { ApiException } from '../../api/api'
import { useAuthToken } from '../useAuthToken'
import { useUser } from '../useUser'

export const useGlobalUnauthTokenClear = () => {
	const [, setAuthToken] = useAuthToken()
	const { error } = useUser()

	useEffect(() => {
		if (!error) {
			return
		}

		if (error instanceof ApiException && error.statusCode === 401) {
			setAuthToken(null)
		}
	}, [error, setAuthToken])
}
