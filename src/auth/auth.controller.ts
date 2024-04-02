import { Body, Controller, Post, Get, Put, Delete, Param, Req, Res, HttpStatus, HttpException, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { PackagesService } from '../packages/packages.service';
import { LegalDeclarationsService } from '../legals/legals.service';

import { GetUser, Auth } from './decorators';
import { ValidRoles } from './interfaces';
import { CreateUserDto, LoginUserDto, ResetPasswordDto, UpdateUserRoleDto, ForgotPasswordDto, StartDayDto } from './dto';

import { validationMessages } from '../common/constants';
import { ExceptionHandlerService } from '../common/helpers';

import { GoogleOauthGuard } from './guards/google-oauth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly configService: ConfigService,
		private readonly authService: AuthService,
		private readonly packagesService: PackagesService,
		private readonly legalDeclarationsService: LegalDeclarationsService,
	) {}

	// POST

	@Post('register')
	@UseInterceptors(FileInterceptor('photoUrl'))
	@ApiOperation({ summary: 'Registrar usuario local' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['name', 'lastname', 'email', 'password'],
			properties: {
				name: { type: 'string', example: 'John' },
				lastname: { type: 'string', example: 'Doe' },
				email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
				password: { type: 'string', format: 'password', example: 'strongPassword123' },
				photoUrl: {
					type: 'string',
					format: 'binary',
					description: 'La carga de la foto en el registro es opcional.',
				},
			},
		},
	})
	async register(@Body() createUserDto: CreateUserDto, @UploadedFile() photo: Express.Multer.File, @Res() res: Response) {
		try {
			await this.authService.register(createUserDto, photo);
			res.status(HttpStatus.CREATED).json({
				message: validationMessages.auth.account.success.registered,
			});
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Post('login')
	@ApiOperation({ summary: 'Iniciar sesión' })
	@ApiBody({
		schema: {
			type: 'object',
			required: ['email', 'password'],
			properties: {
				email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
				password: { type: 'string', format: 'password', example: 'strongPassword123' },
			},
		},
	})
	async login(@Body() loginUserDto: LoginUserDto, @Req() request: Request, @Res() res: Response) {
		try {
			if (request.cookies['Authentication']) return res.status(HttpStatus.BAD_REQUEST).json({ message: validationMessages.auth.account.error.alreadyLoggedIn });

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
	@ApiOperation({ summary: 'Cerrar sesión', description: 'Este endpoint requiere autenticación' })
	@ApiBearerAuth()
	@Auth(ValidRoles.administrador, ValidRoles.repartidor)
	async logout(@Res() res: Response) {
		await this.authService.logout(res);
	}

	@Post('forgot-password')
	@ApiOperation({ summary: 'Enviar clave por mail por olvido de contraseña' })
	@ApiBody({
		schema: {
			type: 'object',
			required: ['email'],
			properties: {
				email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
			},
		},
	})
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
	@ApiOperation({ summary: 'Cambiar contraseña a partir de la clave recibida' })
	@ApiBody({
		schema: {
			type: 'object',
			required: ['token', 'newPassword'],
			properties: {
				token: { type: 'string', example: 'Escribir acá el código recibido por mail' },
				newPassword: { type: 'string', format: 'password', example: 'newStrongPassword123' },
			},
		},
	})
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
	@Get('google')
	@ApiOperation({ summary: 'Iniciar sesión con cuenta de Google (OAuth)' })
	@UseGuards(GoogleOauthGuard)
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	async auth() {}

	@Get('google/callback')
	@ApiOperation({ summary: 'Retorno de inicio de sesión en plataforma de Google' })
	@UseGuards(GoogleOauthGuard)
	async googleAuthCallback(@Req() req, @Res() res: Response) {
		try {
			if (req.cookies['Authentication']) return res.status(HttpStatus.BAD_REQUEST).json({ message: validationMessages.auth.account.error.alreadyLoggedIn });

			const { token, redirectWithError } = await this.authService.oAuthLogin(req.user);

			if (redirectWithError) {
				const frontendUrl = this.configService.get<string>('CORS_ORIGIN');
				return res.redirect(`${frontendUrl}/login?error=${redirectWithError}`);
			}
			const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

			res.cookie('Authentication', token, {
				httpOnly: true,
				path: '/',
				maxAge: 1000 * 60 * 60 * 2,
				sameSite: 'strict',
				secure: isProduction,
			});

			const redirectUrl = this.configService.get<string>('CORS_ORIGIN');
			res.end(res.redirect(`${redirectUrl}/oauth?token=${token}`));
			// res.status(HttpStatus.OK).json({ message: validationMessages.auth.account.success.loggedIn, token: token });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('verify-token')
	@ApiOperation({ summary: 'Verificar clave recibida por mail' })
	@ApiQuery({
		name: 'token',
		required: true,
		type: String,
		description: 'Token de verificación enviado por mail',
	})
	async verifyResetPasswordToken(@Query('token') token: string, @Res() res: Response) {
		try {
			const isValid = await this.authService.verifyResetPasswordToken(token);
			if (isValid) res.status(HttpStatus.OK).json({ message: validationMessages.auth.token.isValid, isValid: true });
			else res.status(HttpStatus.BAD_REQUEST).json({ message: validationMessages.auth.token.invalidOrExpired, isValid: false });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('me')
	@ApiOperation({ summary: 'Obtener perfil del usuario actual', description: 'Este endpoint requiere autenticación' })
	@ApiBearerAuth()
	@Auth(ValidRoles.repartidor, ValidRoles.administrador)
	async getProfile(@GetUser('id') userId: string, @Res() res: Response) {
		try {
			const user = await this.authService.findById(userId);
			if (!user) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...userData } = user.toObject();

			res.status(HttpStatus.OK).json(userData);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('me/packages')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtener paquetes del repartidor actual', description: 'Este endpoint requiere autenticación y tener rol repartidor.' })
	@Auth(ValidRoles.repartidor)
	async getMyPackages(@GetUser('id') userId: string, @Res() res: Response) {
		try {
			const packages = await this.packagesService.findPackagesByDeliveryMan(userId.toString());
			res.status(HttpStatus.OK).json(packages);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('users')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtener todos los usuarios', description: 'Este endpoint requiere autenticación y tener rol administrador.' })
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
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtener datos de un usuario específico', description: 'Este endpoint requiere autenticación.' })
	@ApiParam({
		name: 'userId',
		type: String,
		required: true,
		description: 'UUID del usuario a obtener',
		example: '550e8400-e29b-41d4-a716-446655440000',
	})
	@Auth(ValidRoles.repartidor, ValidRoles.administrador)
	async getUserData(@Param('userId') userId: string, @GetUser() user, @Res() res: Response) {
		try {
			const fullUserDetails = await this.authService.findById(user.id.toString());

			if (!fullUserDetails) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

			if (!fullUserDetails.roles.includes(ValidRoles.administrador) && fullUserDetails._id !== userId)
				throw new HttpException(validationMessages.auth.account.error.unauthorized, HttpStatus.FORBIDDEN);

			const targetUser = await this.authService.findById(userId.toString());
			if (!targetUser) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

			const response = {
				id: targetUser._id,
				name: targetUser.name,
				lastname: targetUser.lastname,
				email: targetUser.email,
				roles: targetUser.roles,
				photoUrl: targetUser.photoUrl,
				state: targetUser.state,
			};

			res.status(HttpStatus.OK).json(response);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('users/state/:state')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtener usuarios por estado', description: 'Este endpoint requiere autenticación y tener rol administrador.' })
	@ApiParam({ name: 'state', type: 'string', required: true, description: 'Estado de un usuario', example: 'activo' })
	@Auth(ValidRoles.administrador)
	async getUsersByState(@Param('state') state: string, @Res() res: Response) {
		try {
			if (!validationMessages.auth.user.state.validStates.includes(state)) throw new HttpException(validationMessages.auth.user.state.invalidStateError, HttpStatus.BAD_REQUEST);

			const users = await this.authService.findUsersByState(state);
			res.status(HttpStatus.OK).json(users);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('users/:uuidUser/packages')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtener paquetes de un usuario específico', description: 'Este endpoint requiere autenticación y tener rol administrador.' })
	@ApiParam({ name: 'uuidUser', type: 'string', required: true, description: 'UUID del usuario a actualizar', example: '550e8400-e29b-41d4-a716-446655440000' })
	@Auth(ValidRoles.administrador)
	async getUserPackages(@Param('uuidUser') uuidUser: string, @Res() res: Response) {
		try {
			const userExists = await this.authService.findById(uuidUser.toString());
			if (!userExists) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

			const packages = await this.packagesService.findPackagesByDeliveryMan(uuidUser.toString());
			res.status(HttpStatus.OK).json(packages);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	// PUT

	@Put('users/:userId/role')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Actualizar el rol de un usuario', description: 'Este endpoint requiere autenticación y tener rol administrador.' })
	@ApiParam({ name: 'userId', type: 'string', required: true, description: 'UUID del usuario a actualizar', example: '550e8400-e29b-41d4-a716-446655440000' })
	@ApiBody({ type: UpdateUserRoleDto })
	@ApiResponse({ status: 200, description: 'Rol actualizado con éxito.' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
	@Auth(ValidRoles.administrador)
	async updateUserRole(@Param('userId') userId: string, @Body() updateUserRoleDto: UpdateUserRoleDto, @GetUser('id') performedById: string, @Res() res: Response) {
		try {
			const updatedUser = await this.authService.updateUserRole(userId.toString(), updateUserRoleDto.roles, performedById.toString());
			if (!updatedUser) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

			res.status(HttpStatus.OK).json({
				message: validationMessages.auth.user.role.updated.replace('${user.name}', updatedUser.name).replace('${user.lastname}', updatedUser.lastname),
			});
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Put('me/packages/:uuidPackage')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Cambiar estado y reordenar lista por inicio de reparto de paquete', description: 'Este endpoint requiere autenticación y tener rol repartidor.' })
	@ApiParam({ name: 'uuidPackage', type: 'string', required: true, description: 'UUID del paquete a actualizar', example: '550e8400-e29b-41d4-a716-446655440000' })
	@ApiResponse({ status: 200, description: 'Paquete modificado con éxito.' })
	@Auth(ValidRoles.repartidor)
	async changePackageStateAndReorder(@Param('uuidPackage') uuidPackage: string, @GetUser() user, @Res() res: Response) {
		try {
			const pkg = await this.packagesService.changeStateAndReorder(user.id.toString(), uuidPackage.toString(), user.id.toString());
			res.status(HttpStatus.OK).json(pkg);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Put('me/packages')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Actualizar paquetes por inicio de jornada de reparto', description: 'Este endpoint requiere autenticación y tener rol repartidor.' })
	@ApiBody({ type: StartDayDto })
	@ApiResponse({ status: 200, description: 'Paquetes actualizados con éxito.' })
	@Auth(ValidRoles.repartidor)
	async updateMyPackages(@GetUser('id') userId: string, @Body() startDayDto: StartDayDto, @Res() res: Response) {
		try {
			const user = await this.authService.findById(userId);
			if (!user) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

			await this.legalDeclarationsService.createDeclaration(userId, startDayDto);

			if (startDayDto.hasConsumedAlcohol || startDayDto.isUsingPsychoactiveDrugs || startDayDto.hasEmotionalDistress) {
				await this.legalDeclarationsService.handleNegativeDeclaration(userId, res);
				return;
			}

			const totalPackagesAfterUpdate = user.packages.length + startDayDto.packages.length;
			if (totalPackagesAfterUpdate > 10) {
				throw new HttpException(validationMessages.packages.userArray.dailyDeliveryLimit, HttpStatus.BAD_REQUEST);
			}

			const notFoundPackages = await this.packagesService.verifyPackageExistence(user.packages);
			if (notFoundPackages.length > 0) {
				const message = validationMessages.packages.userArray.packagesNotFound.replace('${packages}', notFoundPackages.join(', '));
				throw new HttpException(message, HttpStatus.NOT_FOUND);
			}

			let addedPackagesCount = 0;
			let skippedPackagesCount = 0;
			const skippedPackageIds = [];

			for (const packageId of startDayDto.packages) {
				if (user.packages.includes(packageId)) {
					skippedPackagesCount++;
					skippedPackageIds.push(packageId);
					continue;
				}
				await this.packagesService.assignPackageToUser(userId, packageId);
				addedPackagesCount++;
			}

			let message = validationMessages.packages.userArray.updateSummary
				.replace('${addedPackagesCount}', addedPackagesCount.toString())
				.replace('${skippedPackagesCount}', skippedPackagesCount.toString());

			if (skippedPackagesCount > 0) {
				const skippedMessages = skippedPackageIds.map(packageId => validationMessages.packages.userArray.packageAlreadyAssigned.replace('${packageId}', packageId));
				message += ` Detalles: ${skippedMessages.join(', ')}`;
			}

			res.status(HttpStatus.OK).json({ message: message });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Put('me/packages/:uuidPackage/cancel')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Cancelar reparto de un paquete',
		description: 'Este endpoint requiere autenticación, rol repartidor y tener el paquete asignado al listado de paquetes del día para poder cancelarlo.',
	})
	@ApiParam({ name: 'uuidPackage', type: 'string', required: true, description: 'UUID del paquete a cancelar', example: '550e8400-e29b-41d4-a716-446655440000' })
	@Auth(ValidRoles.repartidor)
	async cancelPackage(@Param('uuidPackage') uuidPackage: string, @GetUser('id') userId: string, @Res() res: Response) {
		try {
			await this.packagesService.updatePackageOnCancel(uuidPackage, userId.toString());
			res.status(HttpStatus.OK).json({ message: validationMessages.packages.success.cancelled });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Put('me/packages/:uuidPackage/finish')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Finalizar reaprto de un paquete',
		description: 'Este endpoint requiere autenticación, rol repartidor, y tener el paquete asignado al listado de paquetes para marcarlo como finalizado.',
	})
	@ApiParam({ name: 'uuidPackage', type: 'string', required: true, description: 'UUID del paquete a finalizar reparto', example: '550e8400-e29b-41d4-a716-446655440000' })
	@Auth(ValidRoles.repartidor)
	async finishPackage(@Param('uuidPackage') uuidPackage: string, @GetUser() user, @Res() res: Response) {
		try {
			await this.authService.finishPackage(uuidPackage, user.id);
			res.status(HttpStatus.OK).json({ message: validationMessages.packages.success.delivered });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Put('users/:uuidUser/state')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Cambiar el estado de un usuario', description: 'Este endpoint requiere autenticación y tener rol administrador.' })
	@ApiParam({ name: 'uuidUser', type: 'string', required: true, description: 'UUID del usuario a cambiar estado', example: '550e8400-e29b-41d4-a716-446655440000' })
	@ApiResponse({ status: 200, description: 'Estado del usuario actualizado con éxito' })
	@Auth(ValidRoles.administrador)
	async changeUserState(@Param('uuidUser') uuidUser: string, @GetUser('id') performedById: string, @Res() res: Response) {
		try {
			const newState = await this.authService.changeState(uuidUser, performedById);
			const readableState =
				newState === validationMessages.auth.user.state.isActiveState ? validationMessages.auth.user.state.isActiveState : validationMessages.auth.user.state.isInactiveSate;
			res.status(HttpStatus.OK).json({ message: validationMessages.auth.user.state.changeSuccess.replace('${state}', readableState) });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	// DELETE

	@Delete('me/delete')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Eliminar cuenta de usuario propio',
		description: 'Permite a un usuario eliminar su propia cuenta. Este endpoint requiere autenticación.',
	})
	@Auth(ValidRoles.administrador, ValidRoles.repartidor)
	async deleteOwnUser(@GetUser() user, @Res() res: Response) {
		try {
			const userExists = await this.authService.findById(user.id.toString());

			if (!userExists) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.FORBIDDEN);

			await this.authService.deleteUser(user.id.toString(), user.id.toString());
			res.clearCookie('Authentication');
			res.status(HttpStatus.OK).json({ message: validationMessages.auth.account.success.selfDeleted });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Delete('users/:userId')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Eliminar cuenta de otro usuario',
		description: 'Permite a un administrador eliminar la cuenta de otro usuario o su propia cuenta. Este endpoint requiere autenticación y el rol de administrador.',
	})
	@ApiParam({ name: 'userId', description: 'UUID del usuario a eliminar', required: true, example: '550e8400-e29b-41d4-a716-446655440000' })
	@Auth(ValidRoles.administrador)
	async deleteUser(@Param('userId') userId: string, @GetUser('id') id: string, @Res() res: Response) {
		try {
			const authenticatedUser = await this.authService.findById(id.toString());

			if (!authenticatedUser) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

			if (authenticatedUser._id === userId) {
				await this.authService.deleteUser(userId.toString(), userId.toString());
				res.clearCookie('Authentication');
				return res.status(HttpStatus.OK).json({ message: validationMessages.auth.account.success.selfDeleted });
			}

			const userToDelete = await this.authService.findById(userId.toString());
			if (!userToDelete) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

			await this.authService.deleteUser(userId, userId.toString());

			res.status(HttpStatus.OK).json({
				message: validationMessages.auth.account.success.deleted
					.replace('${user.name}', userToDelete.name)
					.replace('${user.lastname}', userToDelete.lastname)
					.replace('${userId}', userToDelete._id),
			});
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}
}
