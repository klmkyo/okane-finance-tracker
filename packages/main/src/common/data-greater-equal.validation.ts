import { Injectable } from '@nestjs/common'
import {
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	registerDecorator,
} from 'class-validator'

@ValidatorConstraint({ async: true })
@Injectable()
export class DateGreaterThanEqualConstraint
	implements ValidatorConstraintInterface
{
	validate(value: string, args: ValidationArguments): boolean {
		const [getDate] = args.constraints
		return value > getDate()
	}

	defaultMessage({ property, constraints }: ValidationArguments) {
		const [getDate] = constraints
		return `${property} must be greater than ${getDate()}`
	}
}

export function IsDateGreaterThan(
	getDate: () => Date,
	validationOptions?: ValidationOptions,
) {
	return (object: Record<string, any>, propertyName: string): void => {
		registerDecorator({
			name: 'DateGreaterThanEqual',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [getDate],
			validator: DateGreaterThanEqualConstraint,
		})
	}
}
