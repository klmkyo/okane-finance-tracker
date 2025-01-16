import { api } from '../api/api'

interface ImportResult {
	insertedCount: number
}

export const csvService = {
	exportTransactions: async (
		accountId: number,
		periodStartDate: Date,
		periodEndDate: Date,
	) => {
		const response = await api.get<string>(
			`/transactions/export?accountId=${accountId}&periodStartDate=${periodStartDate.toISOString()}&periodEndDate=${periodEndDate.toISOString()}`,
		)

		// response.data is now a string containing CSV content
		const blob = new Blob([response.data], { type: 'text/csv' })
		const url = window.URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.setAttribute(
			'download',
			`transactions_${new Date().toISOString()}.csv`,
		)
		document.body.appendChild(link)
		link.click()
		link.remove()
		window.URL.revokeObjectURL(url)
	},

	importTransactions: async (accountId: number, file: File) => {
		const formData = new FormData()
		formData.append('file', file)

		const response = await api.post<ImportResult>(
			`/transactions/import?accountId=${accountId}`,
			formData,
			{ sendRaw: true },
		)

		return response.data
	},
}
