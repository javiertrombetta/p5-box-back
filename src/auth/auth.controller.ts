import { Body, Controller, Post, Get, Put, Delete, Param, Req, Res, HttpStatus, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GetUser, Auth } from './decorators';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { validationMessages } from '../common/constants';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
		try {
			await this.authService.register(createUserDto);
			res.status(HttpStatus.CREATED).json({
				message: validationMessages.auth.account.registered,
			});
		} catch (error) {
			this.handleException(error, res);
		}
	}

	@Post('login')
	async login(@Body() loginUserDto: LoginUserDto, @Req() request: Request, @Res() res: Response) {
		try {
			if (request.cookies['Authentication']) {
				return res.status(HttpStatus.BAD_REQUEST).json({ message: validationMessages.auth.account.alreadyLoggedIn });
			}

			const { token } = await this.authService.login(loginUserDto);
			res.cookie('Authentication', token, {
				httpOnly: true,
				path: '/',
				maxAge: 1000 * 60 * 60 * 2,
			});
			res.status(HttpStatus.OK).json({ message: validationMessages.auth.account.loggedIn });
		} catch (error) {
			this.handleException(error, res);
		}
	}

	@Get('me')
	@Auth(ValidRoles.repartidor, ValidRoles.administrador)
	getProfile(@GetUser() user: User, @Res() res: Response) {
		res.status(HttpStatus.OK).json(user);
	}

	@Get('users')
	@Auth(ValidRoles.administrador)
	async getAllUsers(@Res() res: Response) {
		try {
			const users = await this.authService.findAll();
			res.status(HttpStatus.OK).json(users);
		} catch (error) {
			this.handleException(error, res);
		}
	}

	@Put(':userId/role')
	@Auth(ValidRoles.administrador)
	async updateUserRole(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto, @Res() response: Response) {
		const updatedUser = await this.authService.updateUserRole(userId, updateUserDto.roles);
		if (!updatedUser) {
			throw new HttpException(validationMessages.auth.account.notFound, HttpStatus.NOT_FOUND);
		}

		response.status(HttpStatus.OK).json({
			message: validationMessages.auth.role.updated.replace('${user.name}', updatedUser.name).replace('${user.lastname}', updatedUser.lastname),
		});
	}

	@Delete('delete')
	@Auth(ValidRoles.administrador, ValidRoles.repartidor)
	async deleteOwnUser(@Req() req: Request, @Res() res: Response) {
		try {
			const user = req.user as User;
			const userExists = await this.authService.findById(user._id);
			if (!userExists) {
				throw new HttpException(validationMessages.auth.account.notFound, HttpStatus.FORBIDDEN);
			}

			await this.authService.deleteUser(user._id);
			res.clearCookie('Authentication');
			res.status(HttpStatus.OK).json({ message: validationMessages.auth.account.selfDeleted });
		} catch (error) {
			this.handleException(error, res);
		}
	}

	@Delete(':userId')
	@Auth(ValidRoles.administrador)
	async deleteUser(@Param('userId') userId: string, @Res() res: Response) {
		try {
			const userToDelete = await this.authService.findById(userId);
			if (!userToDelete) {
				throw new HttpException(validationMessages.auth.account.notFound, HttpStatus.NOT_FOUND);
			}

			await this.authService.deleteUser(userId);

			res.status(HttpStatus.OK).json({
				message: validationMessages.auth.account.deleted.replace('${user.name}', userToDelete.name).replace('${user.lastname}', userToDelete.lastname).replace('${userId}', userId),
			});
		} catch (error) {
			this.handleException(error, res);
		}
	}

	private handleException(error: any, res: Response) {
		if (error instanceof HttpException) {
			res.status(error.getStatus()).json({ message: error.getResponse() });
		} else {
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: validationMessages.auth.error.internal });
		}
	}
}
