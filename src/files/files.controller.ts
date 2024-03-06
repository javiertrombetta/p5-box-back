import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';

import { fileFilter, fileNamer } from './helpers';

@Controller('files')
export class FilesController {
	constructor(
		private readonly filesService: FilesService,
		private readonly configService: ConfigService,
	) {}

	@Get('photo/:imageName')
	findProductImage(@Res() res: Response, @Param('imageName') imageName: string) {
		const path = this.filesService.getStaticUserImage(imageName);

		res.sendFile(path);
	}

	@Post('photo')
	@UseInterceptors(
		FileInterceptor('file', {
			fileFilter: fileFilter,
			limits: { fileSize: 1 * 1024 * 1024 },
			storage: diskStorage({
				destination: './static/photos',
				filename: fileNamer,
			}),
		}),
	)
	uploadProductImage(@UploadedFile() file: Express.Multer.File) {
		if (!file) {
			throw new BadRequestException('Verificar que el archivo sea de formato imagen.');
		}

		// const secureUrl = `${ file.filename }`;
		const secureUrl = `${this.configService.get('HOST_API')}/files/photos/${file.filename}`;

		return { secureUrl };
	}
}
