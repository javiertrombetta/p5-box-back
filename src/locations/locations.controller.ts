import { Controller, Get, Param, Res, HttpStatus, Post, Body } from '@nestjs/common';
import { Response } from 'express';
import { LocationsService } from './locations.service';
import { Auth, GetUser } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { LocationDto, RouteDto } from './dto';
import { User } from '../auth/entities';
import { validationMessages } from '../common/constants';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExceptionHandlerService } from '../common/helpers';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
	constructor(private locationService: LocationsService) {}

	@Get('package/:packageId')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtener ruta para un paquete', description: 'Obtiene la última ubicación del repartidor y calcula la ruta hasta el paquete especificado.' })
	@ApiParam({ name: 'packageId', type: 'string', required: true, description: 'Identificador único del paquete', example: '12345' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Ruta obtenida con éxito.', type: RouteDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Última ubicación no encontrada.' })
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
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Actualizar ubicación del repartidor', description: 'Actualiza la ubicación actual del repartidor.' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Ubicación actualizada con éxito.', type: LocationDto })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de ubicación no válidos.' })
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
