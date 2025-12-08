import { Controller, Get, Post, Delete, Param, UseGuards, ParseIntPipe } from '@nestjs/common'
import { AdminService } from './admin.service'
import { AuthGuard } from 'src/auth/guard/auth.guard'
import { AdminGuard } from 'src/auth/guard/admin.guard'

@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	@Get('users')
	async getAllUsers() {
		return this.adminService.getAllUsers()
	}

	@Post('users/:id/block')
	async blockUser(@Param('id', ParseIntPipe) userId: number) {
		return this.adminService.blockUser(userId)
	}

	@Post('users/:id/unblock')
	async unblockUser(@Param('id', ParseIntPipe) userId: number) {
		return this.adminService.unblockUser(userId)
	}

	@Post('users/:id/promote')
	async promoteToAdmin(@Param('id', ParseIntPipe) userId: number) {
		return this.adminService.promoteToAdmin(userId)
	}

	@Post('users/:id/demote')
	async demoteFromAdmin(@Param('id', ParseIntPipe) userId: number) {
		return this.adminService.demoteFromAdmin(userId)
	}

	@Delete('users/:id')
	async deleteUser(@Param('id', ParseIntPipe) userId: number) {
		return this.adminService.deleteUser(userId)
	}
}
