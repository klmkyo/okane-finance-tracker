import { BadRequestException } from '@nestjs/common'

export function assert(
	condition: any,
	message = 'bad_request',
	Exception = BadRequestException,
): asserts condition {
	if (!condition) {
		throw new Exception(message)
	}
}
