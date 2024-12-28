import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common'
import { AuthGuard } from 'src/auth/guard/auth.guard'
import { UserId } from 'src/users/decorators/user-id.decorator'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@UseGuards(AuthGuard)
@Controller('categories')
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@Post()
	async create(@UserId() userId: number, @Body() body: CreateCategoryDto) {
		return this.categoriesService.create(userId, body)
	}

	@Get()
	async find(@UserId() userId: number) {
		return await this.categoriesService.find(userId)
	}

	@Patch(':id')
	async update(
		@UserId() userId: number,
		@Param('id') categoryId: string,
		@Body() updateCategoryDto: UpdateCategoryDto,
	) {
		return await this.categoriesService.update(
			userId,
			+categoryId,
			updateCategoryDto,
		)
	}

	@Delete(':id')
	async delete(@UserId() userId: number, @Param('id') categoryId: string) {
		return this.categoriesService.delete(userId, +categoryId)
	}
}
