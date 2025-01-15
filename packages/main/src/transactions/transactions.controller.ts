import {
	Body,
	Controller,
	DefaultValuePipe,
	Delete,
	FileTypeValidator,
	Get,
	Param,
	ParseFilePipe,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Response } from 'express'
import { AuthGuard } from 'src/auth/guard/auth.guard'
import { TransactionType } from 'src/common/types'
import { UserId } from 'src/users/decorators/user-id.decorator'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { ExportTransactionsDto } from './dto/export-transactions.dto'
import { ImportTransactionsDto } from './dto/import-transactions.dto'
import { UpdateTransactionDto } from './dto/update-transaction.dto'
import { TransactionsService } from './transactions.service'

@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionsController {
	constructor(private readonly transactionsService: TransactionsService) {}

	@Post()
	async create(@UserId() userId: number, @Body() body: CreateTransactionDto) {
		return await this.transactionsService.create(userId, body)
	}

	@Get('/export')
	async export(
		@Res() res: Response,
		@UserId() userId: number,
		@Query() query: ExportTransactionsDto,
	) {
		const csvBuffer = await this.transactionsService.generateCsv(
			userId,
			query.accountId,
			query.periodStartDate,
			query.periodEndDate,
		)

		res.header('Content-Type', 'text/csv')
		res.attachment('data.csv')
		res.send(csvBuffer)
	}

	// name=file, @see https://maximorlov.com/fix-unexpected-field-error-multer/
	// I WOULD DO A POST BODY, BUT I COULDN'T MAKE IT WORK
	@Post('/import')
	@UseInterceptors(FileInterceptor('file'))
	async import(
		@UserId() userId: number,
		@Query() query: ImportTransactionsDto,
		@UploadedFile(
			new ParseFilePipe({
				validators: [new FileTypeValidator({ fileType: 'text/csv' })],
			}),
		)
		file: Express.Multer.File,
	) {
		return await this.transactionsService.importTransactions(
			userId,
			query.accountId,
			file,
		)
	}

	@Get()
	async find(
		@UserId() userId: number,
		@Query('accountId') accountId: number,
		@Query('categoryId', new DefaultValuePipe(undefined)) categoryId?: number,
		@Query('type', new DefaultValuePipe(undefined)) type?: TransactionType,
	) {
		return await this.transactionsService.find(
			userId,
			accountId,
			categoryId,
			type,
		)
	}

	@Patch(':id')
	async update(
		@UserId() userId: number,
		@Param('id', ParseIntPipe) transactionId: number,
		@Body() body: UpdateTransactionDto,
	) {
		return await this.transactionsService.patch(userId, transactionId, body)
	}

	@Delete(':id')
	async delete(@UserId() userId: number, @Param('id') transactionId: string) {
		return await this.transactionsService.delete(userId, +transactionId)
	}
}
