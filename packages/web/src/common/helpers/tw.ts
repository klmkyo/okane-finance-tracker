import clsx from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * A helper that merges Tailwind classes together
 *
 * @example className={tw('text-white bg-primary', isDisabled && 'bg-primary-600')}
 * @see https://www.npmjs.com/package/clsx
 * @see https://www.npmjs.com/package/tailwind-merge
 */
export const tw = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
