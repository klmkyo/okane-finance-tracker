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
export class GreaterThanPropertyConstraint
	implements ValidatorConstraintInterface
{
	validate(value: string, args: ValidationArguments): boolean {
		const [property] = args.constraints
		const relatedValue = args.object[property]
		return value > relatedValue
	}

	defaultMessage({ property, constraints }: ValidationArguments) {
		const [thanPropertyName] = constraints
		return `${property} must be greater than ${thanPropertyName}`
	}
}

export function IsGreaterThanProperty(
	property: string,
	validationOptions?: ValidationOptions,
) {
	return (object: Record<string, any>, propertyName: string): void => {
		registerDecorator({
			name: 'IsGreaterThanOtherProperty',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [property],
			validator: GreaterThanPropertyConstraint,
		})
	}
}
