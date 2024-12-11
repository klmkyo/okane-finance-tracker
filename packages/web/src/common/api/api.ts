import { env } from '@/env'

export class ApiException extends Error {
	constructor(
		public statusCode: number,
		message: string,
		public data?: any,
	) {
		super(message)
		this.name = 'ApiException'
	}
}

export interface ApiResponse<T = any> {
	statusCode: number
	headers: Headers
	data: T
}

export interface ApiRequestOptions extends RequestInit {
	sendRaw?: boolean
}

export class ApiClient {
	private readonly rootEndpoint: string

	constructor(rootEndpoint: string) {
		this.rootEndpoint = rootEndpoint
	}

	private async executeRequest<T>(
		path: string,
		options?: ApiRequestOptions,
	): Promise<ApiResponse<T>> {
		const fullUrl = `${this.rootEndpoint}${path}`

		const defaultOptions: RequestInit = {
			...options,
			headers: {
				Accept: 'application/json',
				...(options?.sendRaw ? {} : { 'Content-Type': 'application/json' }),
				...options?.headers,
			},
		}

		const modifiedOptions = defaultOptions
		const modifiedUrl = fullUrl

		const rawResponse = await fetch(modifiedUrl, modifiedOptions)

		if (!rawResponse.ok) {
			let errorData: ApiError | undefined
			let errorMessage = rawResponse.statusText

			try {
				errorData = await rawResponse.json()
				if (errorData?.error) {
					errorMessage = errorData.error
				}
			} catch {
				console.error('Unable to parse error response:', rawResponse)
			}

			throw new ApiException(rawResponse.status, errorMessage, errorData)
		}

		const text = await rawResponse.text()
		const isEmpty = !text.trim()
		const data = isEmpty ? null : JSON.parse(text)

		return {
			statusCode: rawResponse.status,
			headers: rawResponse.headers,
			data: data,
		}
	}

	public async get<T>(
		endpoint: string,
		options?: ApiRequestOptions,
	): Promise<ApiResponse<T>> {
		return this.executeRequest<T>(endpoint, {
			method: 'GET',
			...options,
		})
	}

	public async post<T>(
		endpoint: string,
		body: any = {},
		options?: ApiRequestOptions,
	): Promise<ApiResponse<T>> {
		return this.executeRequest<T>(endpoint, {
			method: 'POST',
			body: options?.sendRaw ? body : JSON.stringify(body),
			...options,
		})
	}

	public async put<T>(
		endpoint: string,
		body: any = {},
		options?: ApiRequestOptions,
	): Promise<ApiResponse<T>> {
		return this.executeRequest<T>(endpoint, {
			method: 'PUT',
			body: options?.sendRaw ? body : JSON.stringify(body),
			...options,
		})
	}

	public async delete<T>(
		endpoint: string,
		body: any = {},
		options?: ApiRequestOptions,
	): Promise<ApiResponse<T>> {
		return this.executeRequest<T>(endpoint, {
			method: 'DELETE',
			body: options?.sendRaw ? body : JSON.stringify(body),
			...options,
		})
	}

	public async patch<T>(
		endpoint: string,
		body: any = {},
		options?: ApiRequestOptions,
	): Promise<ApiResponse<T>> {
		return this.executeRequest<T>(endpoint, {
			method: 'PATCH',
			body: options?.sendRaw ? body : JSON.stringify(body),
			...options,
		})
	}
}

export interface ApiError {
	error?: string
	details?: any
}

export const api = new ApiClient(env.NEXT_PUBLIC_API_URL)
