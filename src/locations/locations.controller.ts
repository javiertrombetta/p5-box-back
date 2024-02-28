import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { LocationsService } from './locations.service';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@Controller('location')
export class LocationsController {
	constructor(private locationService: LocationsService) {}

	@Get('/package/:packageId')
	@Auth(ValidRoles.repartidor)
	getPackageLocation(@Param('packageId') packageId: string, @Res() res: Response) {
		return this.locationService.getPackageLocation(packageId, res);
	}
}
