import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Get, Res, HttpStatus, HttpException, Param } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { AuthService } from '../auth/auth.service';
import { PhotosService } from './photos.service';

import { GetUser, Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { fileFilter } from './helpers';
import { validationMessages } from '../common/constants';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { ExceptionHandlerService } from '../common/helpers';

@ApiTags('Photos')
@Controller('photo')
export class PhotoController {
	constructor(
		private readonly photosService: PhotosService,
		private readonly authService: AuthService,
	) {}

	@Post()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Cambiar foto de perfil', description: 'Este endpoint requiere autenticación' })
	@UseInterceptors(
		FileInterceptor(validationMessages.aws.bucketName, {
			fileFilter: fileFilter,
			limits: {
				fileSize: 1 * 1024 * 1024,
			},
		}),
	)
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'Foto de perfil',
		type: UploadPhotoDto,
	})
	@ApiResponse({ status: HttpStatus.OK, description: 'Foto cargada correctamente.' })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Archivo no válido.' })
	@Auth(ValidRoles.repartidor, ValidRoles.administrador)
	async uploadUserPhoto(@UploadedFile() file: Express.Multer.File, @GetUser() user, @Res() res: Response) {
		if (user.provider) {
			return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Los usuarios de OAuth no pueden actualizar su foto de perfil por este medio.' });
		}

		try {
			if (!file) throw new BadRequestException(validationMessages.auth.user.photoUrl.fileNotValid);
			const photoUrl = await this.photosService.uploadFileToS3(file);
			await this.authService.updateUserPhotoUrl(user.id, photoUrl);
			return res.status(HttpStatus.OK).json({ message: validationMessages.auth.user.photoUrl.uploadSuccess, photoUrl });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtener foto de perfil', description: 'Este endpoint requiere autenticación y devuelve la URL de la foto de perfil del usuario autenticado.' })
	@ApiResponse({ status: HttpStatus.OK, description: 'URL de la foto obtenida correctamente.', type: String })
	@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Acceso no autorizado.' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Foto no encontrada.' })
	@Auth(ValidRoles.repartidor, ValidRoles.administrador)
	async getUserPhoto(@GetUser() user, @Res() res: Response) {
		const existingUser = await this.authService.findById(user.id);
		if (!existingUser) {
			throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
		}
		if (!existingUser.photoUrl) {
			throw new HttpException(validationMessages.auth.user.photoUrl.fileNotFound, HttpStatus.NOT_FOUND);
		}

		if (!existingUser.provider) {
			try {
				const urlParts = new URL(existingUser.photoUrl);
				const key = urlParts.pathname.substring(1);
				const photoUrl = await this.photosService.generatePresignedUrl(key);
				return res.status(HttpStatus.OK).json({ photoUrl });
			} catch (error) {
				ExceptionHandlerService.handleException(error, res);
				return;
			}
		}

		return res.status(HttpStatus.OK).json({ photoUrl: existingUser.photoUrl });
	}

	@Get('/user/:userId/photo')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Obtener foto de perfil de un usuario',
		description: 'Este endpoint permite a un administrador obtener la URL de la foto de perfil de un usuario específico.',
	})
	@ApiParam({ name: 'userId', type: 'string', description: 'El ID del usuario', required: true })
	@ApiResponse({ status: HttpStatus.OK, description: 'URL de la foto obtenida correctamente.', type: String })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuario o foto no encontrada.' })
	@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Acceso no autorizado.' })
	@Auth(ValidRoles.administrador)
	async getUserPhotoById(@Param('userId') userId: string, @Res() res: Response) {
		const user = await this.authService.findById(userId);
		if (!user) {
			throw new HttpException(validationMessages.auth.account.error.googleAccountNotFound, HttpStatus.UNAUTHORIZED);
		}
		if (!user.photoUrl) {
			throw new HttpException(validationMessages.auth.user.photoUrl.fileNotFound, HttpStatus.NOT_FOUND);
		}
		try {
			let photoUrl = user.photoUrl;
			if (!user.provider) {
				const urlParts = new URL(user.photoUrl);
				const key = urlParts.pathname.substring(1);
				photoUrl = await this.photosService.generatePresignedUrl(key);
			}
			return res.status(HttpStatus.OK).json({ photoUrl });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}
}
