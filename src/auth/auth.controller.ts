import { Body, Controller, Post, Get, Put, Delete, Param, Req, Res, HttpStatus, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GetUser, Auth } from './decorators';
import { CreateUserDto, LoginUserDto, ResetPasswordDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { validationMessages } from '../common/constants';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	// POST

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

	@Post('logout')
	@Auth(ValidRoles.administrador, ValidRoles.repartidor)
	logout(@Res() res: Response) {
		res.clearCookie('Authentication', {
			httpOnly: true,
			path: '/',
		});
		res.status(HttpStatus.OK).json({ message: validationMessages.auth.account.logout });
	}

	@Post('forgotPassword')
	async forgotPassword(@Body('email') email: string, @Res() res: Response) {
		try {
			await this.authService.forgotPassword(email);
			res.status(HttpStatus.OK).json({ message: validationMessages.auth.forgotPassword.emailSent });
		} catch (error) {
			this.handleException(error, res);
		}
	}

	@Post('resetPassword')
	async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Res() res: Response) {
		try {
			const { token, newPassword } = resetPasswordDto;
			await this.authService.resetPassword(token, newPassword);
			res.status(HttpStatus.OK).json({ message: validationMessages.auth.resetPassword.success });
		} catch (error) {
			this.handleException(error, res);
		}
	}

	// GET

	@Get('me')
	@Auth(ValidRoles.repartidor, ValidRoles.administrador)
	getProfile(@GetUser() user: User, @Res() res: Response) {
		res.status(HttpStatus.OK).json(user);
	}

	@Get('users/:userId')
	@Auth(ValidRoles.repartidor, ValidRoles.administrador)
	async getUserData(@Param('userId') userId: string, @GetUser() user, @Res() res: Response) {
		try {
			const fullUserDetails = await this.authService.findById(user.id);

			if (!fullUserDetails) {
				throw new HttpException(validationMessages.auth.account.notFound, HttpStatus.NOT_FOUND);
			}

			if (!fullUserDetails.roles.includes('administrador') && fullUserDetails._id !== userId) {
				throw new HttpException(validationMessages.auth.account.unauthorized, HttpStatus.FORBIDDEN);
			}

			const targetUser = await this.authService.findById(userId);
			if (!targetUser) {
				throw new HttpException(validationMessages.auth.account.notFound, HttpStatus.NOT_FOUND);
			}

			const response = {
				id: targetUser._id,
				name: targetUser.name,
				lastname: targetUser.lastname,
				email: targetUser.email,
				roles: targetUser.roles,
				photoUrl: targetUser.photoUrl,
			};

			res.status(HttpStatus.OK).json(response);
		} catch (error) {
			this.handleException(error, res);
		}
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

	// PUT

	@Put('users/:userId/role')
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

	// DELETE

	@Delete('me/delete')
	@Auth(ValidRoles.administrador, ValidRoles.repartidor)
	async deleteOwnUser(@GetUser() user, @Res() res: Response) {
		try {
			const userExists = await this.authService.findById(user.id);

			if (!userExists) {
				throw new HttpException(validationMessages.auth.account.notFound, HttpStatus.FORBIDDEN);
			}

			await this.authService.deleteUser(userExists._id);
			res.clearCookie('Authentication');
			res.status(HttpStatus.OK).json({ message: validationMessages.auth.account.selfDeleted });
		} catch (error) {
			this.handleException(error, res);
		}
	}

	@Delete('users/:userId')
	@Auth(ValidRoles.administrador)
	async deleteUser(@Param('userId') userId: string, @GetUser() user, @Res() res: Response) {
		try {
			const authenticatedUser = await this.authService.findById(user.id);

			if (!authenticatedUser) {
				throw new HttpException(validationMessages.auth.account.notFound, HttpStatus.NOT_FOUND);
			}

			if (authenticatedUser._id === userId) {
				await this.authService.deleteUser(userId);
				res.clearCookie('Authentication');
				return res.status(HttpStatus.OK).json({ message: validationMessages.auth.account.selfDeleted });
			}

			const userToDelete = await this.authService.findById(userId);
			if (!userToDelete) {
				throw new HttpException(validationMessages.auth.account.notFound, HttpStatus.NOT_FOUND);
			}

			await this.authService.deleteUser(userId);

			res.status(HttpStatus.OK).json({
				message: validationMessages.auth.account.deleted.replace('${user.name}', userToDelete.name).replace('${user.lastname}', userToDelete.lastname),
			});
		} catch (error) {
			this.handleException(error, res);
		}
	}

	private handleException(error: any, res: Response) {
		console.error(error);
		if (error instanceof HttpException) {
			res.status(error.getStatus()).json({ message: error.getResponse() });
		} else {
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: validationMessages.auth.error.internal });
		}
	}
}
