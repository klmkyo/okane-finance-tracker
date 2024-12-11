'use client'

import { useGlobalUnauthTokenClear } from '../hooks/global/useGlobalUnauthTokenClear'

export const GlobalEventsProvider = () => {
	useGlobalUnauthTokenClear()

	return null
}
