import { sha256 } from 'js-sha256'

export const random = (min: number, max: number, seed?: string) => {
	if (seed) {
		return Math.floor(seededRandom(seed) * (max - min + 1) + min)
	}

	return Math.floor(Math.random() * (max - min + 1) + min)
}

export const randomFloat = (min: number, max: number, seed?: string) => {
	if (seed) {
		return seededRandom(seed) * (max - min) + min
	}

	return Math.random() * (max - min) + min
}

export const seededRandom = (seed: string) => {
	const digest = sha256(seed)
	const value = Number.parseInt(digest.slice(0, 12), 16)
	return value / 2 ** 48
}

export const randomBool = (probability: number, seed?: string) => {
	if (seed) {
		return seededRandom(seed) < probability
	}

	return Math.random() < probability
}

export const generateSeed = () => {
	return Math.random().toString(36).substring(7)
}

export const takeWeightedRandom = <T>(
	list: T[],
	weights: number[],
	seed?: string,
): T => {
	if (list.length !== weights.length) {
		throw new Error('List and weights must be the same length')
	}

	const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

	if (totalWeight <= 0) {
		throw new Error('Total weight must be greater than zero')
	}

	const r = seed
		? seededRandom(seed) * totalWeight
		: Math.random() * totalWeight

	let cumulativeSum = 0
	for (let i = 0; i < weights.length; i++) {
		cumulativeSum += weights[i]
		if (r < cumulativeSum) {
			return list[i]
		}
	}

	// In case of rounding errors, return the last element
	return list[list.length - 1]
}

export const generateUUID = (seed: string): string => {
	const hash = sha256(seed)

	const segment1 = hash.slice(0, 8)
	const segment2 = hash.slice(8, 12)
	const segment3 = hash.slice(12, 16)
	const segment4 = hash.slice(16, 20)
	const segment5 = hash.slice(20, 32)

	const uuid = `${segment1}-${segment2}-4${segment3.slice(1)}-a${segment4.slice(1)}-${segment5}`

	return uuid
}
