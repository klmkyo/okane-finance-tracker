import { useMutation } from '@tanstack/react-query'
import { api } from '../api/api'

export const useLogout = () => {
	const mutation = useMutation({
		mutationKey: ['logout'],
		mutationFn: async () => {
			await api.post('/auth/logout')
		},
		onSettled: () => {
			document.cookie = 'token=; path=/;'
		},
	})

	return mutation
}
