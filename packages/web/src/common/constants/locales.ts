export const LOCALES = [
	{ code: 'en', name: 'English', flag: '🇬🇧' },
	{ code: 'pl', name: 'Polski', flag: '🇵🇱' },
] as const

export type LocaleCode = (typeof LOCALES)[number]['code']
