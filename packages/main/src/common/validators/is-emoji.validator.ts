import { ValidationOptions, registerDecorator } from 'class-validator'

export function IsEmoji(validationOptions?: ValidationOptions) {
	return (object: object, propertyName: string) => {
		registerDecorator({
			name: 'isEmoji',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: any) {
					if (typeof value !== 'string') return false
					// Emoji regex pattern
					const emojiPattern = /^(\p{Emoji})$/gu
					return emojiPattern.test(value)
				},
				defaultMessage: () => 'Field must contain a single emoji',
			},
		})
	}
}
