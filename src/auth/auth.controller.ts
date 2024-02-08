import { Body, Controller, Post, Get, Put, Delete, Param, UseGuards, Req, Res, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { validationMessages } from '../common/constants/validation-messages.constants';
import { Auth } from './decorators/auth.decorator';
import { User as UserDocument } from './entities/user.entity';
import { Request, Response } from 'express';
import { JwtRoleGuard } from './guards/jwt-role.guard';
import { ValidRoles } from './interfaces/valid-roles.interface';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	async register(@Body() createUserDto: CreateUserDto, @Res() response: Response) {
		await this.authService.register(createUserDto);
		response.status(HttpStatus.CREATED).json({
			message: validationMessages.user.success.userRegistered,
		});
	}

	@Post('login')
	async login(@Body() loginUserDto: LoginUserDto, @Res() response: Response) {
		const { token } = await this.authService.login(loginUserDto);
		response.setHeader('Authorization', `Bearer ${token}`);
		response.status(HttpStatus.OK).json({
			message: validationMessages.user.success.userLoggedIn,
		});
	}

	@Get('/me')
	@UseGuards(JwtRoleGuard)
	getProfile(@Req() req: Request) {
		return req.user;
	}

	@Get('/users')
	@Auth(ValidRoles.admin)
	async getAllUsers(@Res() response: Response) {
		const users = await this.authService.findAll();
		response.status(HttpStatus.OK).json(users);
	}

	@Put('/users/:userId/role')
	@Auth(ValidRoles.admin)
	async updateUserRole(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto, @Res() response: Response) {
		await this.authService.updateUserRole(userId, updateUserDto.role);
		response.status(HttpStatus.OK).json({ message: validationMessages.user.success.userUpdated });
	}

	@Delete('/users/delete')
	@UseGuards(JwtRoleGuard)
	async deleteOwnUser(@Req() req: Request, @Res() response: Response) {
		const user = req.user as UserDocument;
		await this.authService.deleteUser(user._id);
		response.status(HttpStatus.OK).json({ message: validationMessages.user.success.userSelfDeleted });
	}

	@Delete('/users/:userId')
	@Auth(ValidRoles.admin)
	async deleteUser(@Param('userId') userId: string, @Res() response: Response) {
		const user = await this.authService.findById(userId);
		if (!user) {
			throw new HttpException(validationMessages.user.error.userNotFound, HttpStatus.NOT_FOUND);
		}
		await this.authService.deleteUser(userId);
		response.status(HttpStatus.OK).json({ message: validationMessages.user.success.userDeleted });
	}
}
