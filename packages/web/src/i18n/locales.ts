export const LOCALES = [
	{ code: 'en', name: 'English', flag: '🇬🇧' },
	{ code: 'pl', name: 'Polski', flag: '🇵🇱' },
	{ code: 'de', name: 'Deutsch', flag: '🇩🇪' },
	{ code: 'es', name: 'Español', flag: '🇪🇸' },
] as const

export type LocaleCode = (typeof LOCALES)[number]['code']
