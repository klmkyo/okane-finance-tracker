import { useCallback, useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useEventCallback, useEventListener } from 'usehooks-ts'

declare global {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface WindowEventMap {
		'local-storage': CustomEvent
	}
}

export type UseLocalStorageOptions<T> = {
	serializer?: (value: T) => string
	deserializer?: (value: string) => T
	initializeWithValue?: boolean
	enabled?: boolean
}

const IS_SERVER = typeof window === 'undefined'

export function useLocalStorage<T>(
	key: string,
	initialValue: T | (() => T),
	options: UseLocalStorageOptions<T> = {},
): [T, Dispatch<SetStateAction<T>>, () => void, boolean] {
	const { initializeWithValue = false, enabled = true } = options

	const serializer = useCallback<(value: T) => string>(
		(value) => {
			if (options.serializer) {
				return options.serializer(value)
			}

			return JSON.stringify(value)
		},
		[options],
	)

	const deserializer = useCallback<(value: string) => T>(
		(value) => {
			if (options.deserializer) {
				return options.deserializer(value)
			}
			// Support 'undefined' as a value
			if (value === 'undefined') {
				return undefined as unknown as T
			}

			const defaultValue =
				initialValue instanceof Function ? initialValue() : initialValue

			let parsed: unknown
			try {
				parsed = JSON.parse(value)
			} catch (error) {
				console.error('Error parsing JSON:', error)
				return defaultValue // Return initialValue if parsing fails
			}

			return parsed as T
		},
		[options, initialValue],
	)

	// Get from local storage then
	// parse stored json or return initialValue
	const readValue = useCallback((): T => {
		const initialValueToUse =
			initialValue instanceof Function ? initialValue() : initialValue

		// Prevent build error "window is undefined" but keep working
		if (IS_SERVER || !enabled) {
			return initialValueToUse
		}

		try {
			const raw = window.localStorage.getItem(key)
			return raw ? deserializer(raw) : initialValueToUse
		} catch (error) {
			console.warn(`Error reading localStorage key “${key}”:`, error)
			return initialValueToUse
		}
	}, [initialValue, key, deserializer, enabled])

	const [initialized, setInitialized] = useState(initializeWithValue)
	const [storedValue, setStoredValue] = useState(() => {
		if (initializeWithValue && enabled) {
			return readValue()
		}

		return initialValue instanceof Function ? initialValue() : initialValue
	})

	// Return a wrapped version of useState's setter function that ...
	// ... persists the new value to localStorage.
	const setValue: Dispatch<SetStateAction<T>> = useEventCallback((value) => {
		// Only interact with localStorage if enabled and not server
		if (enabled && !IS_SERVER) {
			try {
				// Allow value to be a function so we have the same API as useState
				const newValue = value instanceof Function ? value(readValue()) : value

				// Save to local storage
				window.localStorage.setItem(key, serializer(newValue))

				// Save state
				setStoredValue(newValue)

				// We dispatch a custom event so every similar useLocalStorage hook is notified
				window.dispatchEvent(new StorageEvent('local-storage', { key }))
			} catch (error) {
				console.warn(`Error setting localStorage key “${key}”:`, error)
			}
		} else {
			// If not enabled, just update the state
			setStoredValue(value instanceof Function ? value(storedValue) : value)
		}
	})

	const removeValue = useEventCallback(() => {
		if (enabled && !IS_SERVER) {
			try {
				const defaultValue =
					initialValue instanceof Function ? initialValue() : initialValue

				// Remove the key from local storage
				window.localStorage.removeItem(key)

				// Save state with default value
				setStoredValue(defaultValue)

				// We dispatch a custom event so every similar useLocalStorage hook is notified
				window.dispatchEvent(new StorageEvent('local-storage', { key }))
			} catch (error) {
				console.warn(`Error removing localStorage key “${key}”:`, error)
			}
		} else {
			// If not enabled, just reset the state to default
			const defaultValue =
				initialValue instanceof Function ? initialValue() : initialValue
			setStoredValue(defaultValue)
		}
	})

	// biome-ignore lint/correctness/useExhaustiveDependencies: We only want to run this effect once per key, and if enabled changes
	useEffect(() => {
		if (enabled) {
			setStoredValue(readValue())
			setInitialized(true)
		} else {
			setStoredValue(
				initialValue instanceof Function ? initialValue() : initialValue,
			)
			setInitialized(true)
		}
	}, [key, enabled])

	const handleStorageChange = useCallback(
		(event: StorageEvent | CustomEvent) => {
			if (!enabled) return

			if ((event as StorageEvent).key && (event as StorageEvent).key !== key) {
				return
			}
			setStoredValue(readValue())
		},
		[key, readValue, enabled],
	)

	// this only works for other documents, not the current one
	useEventListener('storage', handleStorageChange)

	// this is a custom event, triggered in writeValueToLocalStorage
	// See: useLocalStorage()
	useEventListener('local-storage', handleStorageChange)

	return [storedValue, setValue, removeValue, initialized]
}
