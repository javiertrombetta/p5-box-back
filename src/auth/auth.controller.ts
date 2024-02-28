import { Body, Controller, Post, Get, Put, Delete, Param, Req, Res, HttpStatus, HttpException, Query } from '@nestjs/common';
import { Request, Response } from 'express';

import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { PackagesService } from '../packages/packages.service';

import { GetUser, Auth } from './decorators';
import { ValidRoles } from './interfaces';
import { CreateUserDto, LoginUserDto, ResetPasswordDto, UpdateUserDto, ForgotPasswordDto, StartDayDto } from './dto';

import { validationMessages } from '../common/constants';
import { ExceptionHandlerService } from '../common/helpers';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly packagesService: PackagesService,
	) {}

	// POST

	@Post('register')
	async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
		try {
			await this.authService.register(createUserDto);
			res.status(HttpStatus.CREATED).json({
				message: validationMessages.auth.account.success.registered,
			});
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Post('login')
	async login(@Body() loginUserDto: LoginUserDto, @Req() request: Request, @Res() res: Response) {
		try {
			if (request.cookies['Authentication']) {
				return res.status(HttpStatus.BAD_REQUEST).json({ message: validationMessages.auth.account.error.alreadyLoggedIn });
			}

			const { token } = await this.authService.login(loginUserDto);
			res.cookie('Authentication', token, {
				httpOnly: true,
				path: '/',
				maxAge: 1000 * 60 * 60 * 2,
			});
			res.status(HttpStatus.OK).json({ message: validationMessages.auth.account.success.loggedIn });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Post('logout')
	@Auth(ValidRoles.administrador, ValidRoles.repartidor)
	logout(@Res() res: Response) {
		res.clearCookie('Authentication', {
			httpOnly: true,
			path: '/',
		});
		res.status(HttpStatus.OK).json({ message: validationMessages.auth.account.success.logout });
	}

	@Post('forgot-password')
	async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto, @Res() res: Response) {
		try {
			const { email } = forgotPasswordDto;
			await this.authService.forgotPassword(email);
			res.status(HttpStatus.OK).json({ message: validationMessages.auth.forgotPassword.emailSent });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Post('reset-password')
	async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Req() req: Request, @Res() res: Response) {
		try {
			const { token, newPassword } = resetPasswordDto;
			await this.authService.resetPassword(token, newPassword);

			res.clearCookie('Authentication', {
				httpOnly: true,
				path: '/',
			});

			res.status(HttpStatus.OK).json({ message: validationMessages.auth.resetPassword.success });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	// GET

	@Get('verify-token')
	async verifyResetPasswordToken(@Query('token') token: string, @Res() res: Response) {
		try {
			const isValid = await this.authService.verifyResetPasswordToken(token);
			if (isValid) {
				res.status(HttpStatus.OK).json({ message: validationMessages.auth.token.isValid, isValid: true });
			} else {
				res.status(HttpStatus.BAD_REQUEST).json({ message: validationMessages.auth.token.invalidOrExpired, isValid: false });
			}
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('me')
	@Auth(ValidRoles.repartidor, ValidRoles.administrador)
	getProfile(@GetUser() user: User, @Res() res: Response) {
		res.status(HttpStatus.OK).json(user);
	}

	@Get('me/packages')
	@Auth(ValidRoles.repartidor)
	async getMyPackages(@GetUser('id') userId: string, @Res() res: Response) {
		try {
			const packages = await this.packagesService.findPackages(userId.toString());
			res.status(HttpStatus.OK).json(packages);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('users')
	@Auth(ValidRoles.administrador)
	async getAllUsers(@Res() res: Response) {
		try {
			const users = await this.authService.findAll();
			res.status(HttpStatus.OK).json(users);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('users/:userId')
	@Auth(ValidRoles.repartidor, ValidRoles.administrador)
	async getUserData(@Param('userId') userId: string, @GetUser() user, @Res() res: Response) {
		try {
			const fullUserDetails = await this.authService.findById(user.id.toString());

			if (!fullUserDetails) {
				throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
			}

			if (!fullUserDetails.roles.includes(ValidRoles.administrador) && fullUserDetails._id !== userId) {
				throw new HttpException(validationMessages.auth.account.error.unauthorized, HttpStatus.FORBIDDEN);
			}

			const targetUser = await this.authService.findById(userId.toString());
			if (!targetUser) {
				throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
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
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('/users/:uuidUser/packages')
	@Auth(ValidRoles.administrador)
	async getUserPackages(@Param('uuidUser') uuidUser: string, @Res() res: Response) {
		try {
			const userExists = await this.authService.findById(uuidUser.toString());
			if (!userExists) {
				throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
			}

			const packages = await this.packagesService.findPackages(uuidUser.toString());
			res.status(HttpStatus.OK).json(packages);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	// PUT

	@Put('users/:userId/role')
	@Auth(ValidRoles.administrador)
	async updateUserRole(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto, @GetUser('id') performedById: string, @Res() res: Response) {
		try {
			const updatedUser = await this.authService.updateUserRole(userId.toString(), updateUserDto.roles, performedById.toString());
			if (!updatedUser) {
				throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
			}

			res.status(HttpStatus.OK).json({
				message: validationMessages.auth.user.role.updated.replace('${user.name}', updatedUser.name).replace('${user.lastname}', updatedUser.lastname),
			});
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Put('me/packages/:uuidPackage')
	@Auth(ValidRoles.repartidor)
	async changePackageStateAndReorder(@Param('uuidPackage') uuidPackage: string, @GetUser() user, @Res() res: Response) {
		try {
			const pkg = await this.packagesService.changeStateAndReorder(user.id.toString(), uuidPackage.toString(), user.id.toString(), res);
			res.status(HttpStatus.OK).json(pkg);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Put('me/packages')
	@Auth(ValidRoles.repartidor)
	async updateMyPackages(@GetUser('id') userId: string, @Body() startDayDto: StartDayDto, @Res() res: Response) {
		try {
			const { packages } = startDayDto;
			if (packages.length > 10) {
				throw new HttpException(validationMessages.packages.userArray.dailyDeliveryLimit, HttpStatus.BAD_REQUEST);
			}

			const user = await this.authService.findById(userId);
			if (!user) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

			for (const packageId of user.packages) {
				await this.packagesService.updatePackageOnCancel(packageId, userId, res);
			}

			for (const packageId of packages) {
				await this.packagesService.assignPackageToUser(userId, packageId, res);
			}

			res.status(HttpStatus.OK).json({ message: validationMessages.packages.success.updatedPackages });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Put('/me/packages/:uuidPackage/cancel')
	@Auth(ValidRoles.repartidor)
	async cancelPackage(@Param('uuidPackage') uuidPackage: string, @GetUser('id') userId: string, @Res() res: Response) {
		try {
			await this.packagesService.updatePackageOnCancel(uuidPackage, userId, res);
			res.status(HttpStatus.OK).json({ message: validationMessages.packages.success.cancelled });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Put('/me/packages/:uuidPackage/finish')
	@Auth(ValidRoles.repartidor)
	async finishPackage(@Param('uuidPackage') uuidPackage: string, @GetUser() user, @Res() res: Response) {
		try {
			await this.authService.finishPackage(uuidPackage, user.id);
			res.status(HttpStatus.OK).json({ message: validationMessages.packages.success.delivered });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Put(':uuidUser/state')
	@Auth(ValidRoles.administrador)
	async changeUserState(@Param('uuidUser') uuidUser: string, @Body('state') newState: string, @Res() res: Response) {
		try {
			await this.authService.changeState(uuidUser, newState);
			res.status(HttpStatus.OK).json({ message: validationMessages.auth.user.state.updated });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	// DELETE

	@Delete('me/delete')
	@Auth(ValidRoles.administrador, ValidRoles.repartidor)
	async deleteOwnUser(@GetUser() user, @Res() res: Response) {
		try {
			const userExists = await this.authService.findById(user.id.toString());

			console.log(userExists);

			if (!userExists) {
				throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.FORBIDDEN);
			}

			await this.authService.deleteUser(user.id.toString(), user.id.toString(), res);
			res.clearCookie('Authentication');
			res.status(HttpStatus.OK).json({ message: validationMessages.auth.account.success.selfDeleted });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Delete('users/:userId')
	@Auth(ValidRoles.administrador)
	async deleteUser(@Param('userId') userId: string, @GetUser() user, @Res() res: Response) {
		try {
			const authenticatedUser = await this.authService.findById(user.id.toString());

			if (!authenticatedUser) {
				throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
			}

			if (authenticatedUser._id === userId) {
				await this.authService.deleteUser(userId.toString(), userId.toString(), res);
				res.clearCookie('Authentication');
				return res.status(HttpStatus.OK).json({ message: validationMessages.auth.account.success.selfDeleted });
			}

			const userToDelete = await this.authService.findById(userId.toString());
			if (!userToDelete) {
				throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
			}

			await this.authService.deleteUser(userId, userId.toString(), res);

			res.status(HttpStatus.OK).json({
				message: validationMessages.auth.account.success.deleted.replace('${user.name}', userToDelete.name).replace('${user.lastname}', userToDelete.lastname),
			});
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}
}
