import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { SeedService } from './seed.service';
import { ApiTags } from '@nestjs/swagger';
import { ExceptionHandlerService } from '../common/helpers/exception-handler.service';
@ApiTags('Seed')
@Controller('seed')
export class SeedController {
	constructor(private readonly seedService: SeedService) {}

	@Get()
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
