import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';

import { LogService } from './log.service';
import { CreateLogDto } from './dto/create-log.dto';
import { ApiTags } from '@nestjs/swagger';
import { ExceptionHandlerService } from '../common/helpers/exception-handler.service';

@ApiTags('Logs')
@Controller('logs')
export class LogController {
	constructor(private readonly logService: LogService) {}

	@Post()
	async create(@Body() createLogDto: CreateLogDto, @Res() res: Response) {
		try {
			const newLog = await this.logService.create(createLogDto);
			res.json(newLog);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get()
	async findAll(@Res() res: Response) {
		try {
			const logs = await this.logService.findAll();
			res.json(logs);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}
}
