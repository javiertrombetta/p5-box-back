import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { SeedService } from './seed.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExceptionHandlerService } from '../common/helpers/exception-handler.service';
@ApiTags('Seed')
@Controller('seed')
export class SeedController {
	constructor(private readonly seedService: SeedService) {}

	@Get()
	@ApiOperation({
		summary: 'Poblar base de datos con datos iniciales',
		description:
			'Este endpoint se utiliza para poblar la base de datos con datos iniciales para propósitos de desarrollo o pruebas. Debe usarse con precaución en entornos de producción.',
	})
	@ApiResponse({ status: 200, description: 'Base de datos poblada con éxito. Retorna detalles del proceso de inicialización.' })
	@ApiResponse({ status: 500, description: 'Error del servidor interno. El proceso de población falló.' })
	async runSeed(@Res() res: Response) {
		try {
			const result = await this.seedService.populateDB();
			res.clearCookie('Authentication');
			res.json(result);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}
}
