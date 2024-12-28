import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Category, Database } from 'database/schema'
import { and, eq, or } from 'drizzle-orm'
import { assert } from 'src/common/assert'
import { DB, SUCCESS } from 'src/common/constants'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Injectable()
export class CategoriesService {
	constructor(@Inject(DB) private db: Database) {}

	async create(userId: number, data: CreateCategoryDto) {
		return await this.db
			.insert(Category)
			.values({ ...data, userId } as any) // why?? it works in runtime
			.returning()
	}

	async find(userId: number) {
		const categories = await this.db
			.select()
			.from(Category)
			.where(or(eq(Category.userId, userId), eq(Category.userId, null)))

		const nest = (items, id = null, link = 'parentCategoryId') =>
			items
				.filter((item) => item[link] === id)
				.map((item) => ({ ...item, subcategories: nest(items, item.id) }))

		return nest(categories)
	}

	async update(userId: number, categoryId: number, data: UpdateCategoryDto) {
		const [category] = await this.db
			.update(Category)
			.set(data)
			.where(and(eq(Category.id, categoryId), eq(Category.userId, userId)))
			.returning()

		assert(category, 'category_not_found', NotFoundException)
		return category
	}

	async delete(userId: number, categoryId: number) {
		const [category] = await this.db
			.delete(Category)
			.where(and(eq(Category.userId, userId), eq(Category.id, categoryId)))
			.returning()

		assert(category, 'category_not_found', NotFoundException)
		return SUCCESS
	}
}
