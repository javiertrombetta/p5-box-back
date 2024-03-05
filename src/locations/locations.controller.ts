import { Controller, Get, Param, Res, HttpStatus, Post, Body } from '@nestjs/common';
import { Response } from 'express';
import { LocationsService } from './locations.service';
import { Auth, GetUser } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { LocationDto } from './dto';
import { User } from '../auth/entities';
import { validationMessages } from '../common/constants';
import { ApiTags } from '@nestjs/swagger';
import { ExceptionHandlerService } from '../common/helpers';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
	constructor(private locationService: LocationsService) {}

	@Get('package/:packageId')
	@Auth(ValidRoles.repartidor)
	async getRoute(@Param('packageId') packageId: string, @GetUser() user: User, @Res() res: Response) {
		try {
			const lastLocation = await this.locationService.getLastUserLocation(user.id.toString());
			if (!lastLocation) {
				return res.status(HttpStatus.NOT_FOUND).json({ message: validationMessages.locations.lastLocation });
			}

			const originLatitude = lastLocation.latitude;
			const originLongitude = lastLocation.longitude;

			const route = await this.locationService.getRoute(originLatitude, originLongitude, packageId);
			res.status(HttpStatus.OK).json(route);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Post('deliveryman/update')
	@Auth(ValidRoles.repartidor)
	async updateLocation(@Body() locationDto: LocationDto, @GetUser() user: User, @Res() res: Response) {
		try {
			const updatedLocation = await this.locationService.updateUserLocation(user.id.toString(), locationDto);
			res.status(HttpStatus.OK).json(updatedLocation);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}
}
