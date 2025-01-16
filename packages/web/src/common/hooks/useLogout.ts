import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/api'
import { useAuthToken } from './useAuthToken'
import { useRouter } from 'next/navigation'

export const useLogout = () => {
	const [, setToken] = useAuthToken()
	const router = useRouter()
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationKey: ['logout'],
		mutationFn: async () => {
			return (await api.post('/auth/logout')).data
		},
		onSettled: () => {
			setToken(null)
			router.push('/')
			queryClient.clear()
		},
	})

	return mutation
}
