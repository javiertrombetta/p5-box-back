import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
	constructor(private readonly seedService: SeedService) {}

	@Get()
	async runSeed(@Res() res: Response) {
		const result = await this.seedService.populateDB();

		res.clearCookie('Authentication');

		res.json(result);
	}
}
