import { useLocalStorage } from 'usehooks-ts'
import { EStorageItem } from '../constants/storageItem'

export const useAuthToken = () => {
	return useLocalStorage<string | null>(EStorageItem.USER_TOKEN, null)
}
