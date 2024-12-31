import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator'
import * as pginterval from 'postgres-interval'

@ValidatorConstraint()
export class PostgresIntervalConstraint
	implements ValidatorConstraintInterface
{
	validate(value: unknown) {
		if (typeof value !== 'string') {
			return false
		}
		const interval = pginterval(value)
		return Object.values(interval).some((t) => t !== 0)
	}

	defaultMessage({ property }: ValidationArguments) {
		return `${property} must be a valid Postgres interval duration`
	}
}

export function IsPostgresInterval(validationOptions?: ValidationOptions) {
	return (object: Record<string, any>, propertyName: string): void => {
		registerDecorator({
			name: 'IsPostgresInterval',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: PostgresIntervalConstraint,
		})
	}
}
