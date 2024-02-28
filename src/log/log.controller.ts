import { Controller, Get, Post, Body } from '@nestjs/common';

import { LogService } from './log.service';
import { CreateLogDto } from './dto/create-log.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Logs')
@Controller('logs')
export class LogController {
	constructor(private readonly logService: LogService) {}

	@Post()
	create(@Body() createLogDto: CreateLogDto) {
		return this.logService.create(createLogDto);
	}

	@Get()
	findAll() {
		return this.logService.findAll();
	}
}
