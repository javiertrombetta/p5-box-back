import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';

import { LogService } from './log.service';
import { CreateLogDto } from './dto/create-log.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExceptionHandlerService } from '../common/helpers/exception-handler.service';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@ApiTags('Logs')
@Controller('logs')
export class LogController {
	constructor(private readonly logService: LogService) {}

	@Post()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Crear una nueva entrada de log', description: 'Este endpoint requiere autenticación.' })
	@ApiBody({ type: CreateLogDto })
	@ApiResponse({ status: 201, description: 'Se logueó exitosamente.' })
	@Auth(ValidRoles.administrador, ValidRoles.repartidor)
	async create(@Body() createLogDto: CreateLogDto, @Res() res: Response) {
		try {
			const newLog = await this.logService.create(createLogDto);
			res.json(newLog);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtener todos los logs', description: 'Este endpoint requiere autenticación.' })
	@ApiResponse({ status: 200, description: 'Listado de logs.' })
	@Auth(ValidRoles.administrador, ValidRoles.repartidor)
	async findAll(@Res() res: Response) {
		try {
			const logs = await this.logService.findAll();
			res.json(logs);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}
}
