import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
	private photosDirectory = join(__dirname, '../../static/photos');

	constructor() {
		if (!existsSync(this.photosDirectory)) {
			mkdirSync(this.photosDirectory, { recursive: true });
		}
	}

	getStaticUserImage(imageName: string): string {
		const path = join(this.photosDirectory, imageName);

		if (!existsSync(path)) throw new BadRequestException(`No se encontró un usuario con la imagen ${imageName}.`);

		return path;
	}

	async saveUserImage(file: Express.Multer.File): Promise<string> {
		if (!file) throw new BadRequestException('El archivo no puede estar vacío.');

		const fileExtension = file.originalname.split('.').pop();
		const fileName = `${uuidv4()}.${fileExtension}`;
		const filePath = join(this.photosDirectory, fileName);

		try {
			writeFileSync(filePath, file.buffer);
			return fileName;
		} catch (error) {
			throw new BadRequestException('Error al guardar el archivo.');
		}
	}
}
