import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExceptionHandlerService } from '../common/helpers';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
	constructor(private readonly reportsService: ReportsService) {}

	@Get('deliveryman/all/state/totals/:year/:month/:day')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Informe total de estados de repartidores',
		description: 'Obtener el total de repartidores disponibles por estado en una fecha específica. Requiere autenticación y rol de administrador.',
	})
	@ApiParam({ name: 'year', type: 'string', description: 'Año para el informe', example: '2024' })
	@ApiParam({ name: 'month', type: 'string', description: 'Mes para el informe', example: '03' })
	@ApiParam({ name: 'day', type: 'string', description: 'Día para el informe', example: '15' })
	@ApiResponse({ status: 200, description: 'Informe generado correctamente.' })
	@ApiResponse({ status: 500, description: 'Error del servidor.' })
	@Auth(ValidRoles.administrador)
	async getReport(@Param('year') year: string, @Param('month') month: string, @Param('day') day: string, @Res() res: Response) {
		try {
			const report = await this.reportsService.getAvailableDeliverymanReport(year, month, day);
			res.json(report);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('deliveryman/all/state/details/:year/:month/:day')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtener detalles del estado de los repartidores', description: 'Obtiene detalles del estado de los repartidores para una fecha específica.' })
	@ApiParam({ name: 'year', description: 'Año para el informe', type: String, example: '2024' })
	@ApiParam({ name: 'month', description: 'Mes para el informe', type: String, example: '04' })
	@ApiParam({ name: 'day', description: 'Día para el informe', type: String, example: '15' })
	@ApiResponse({ status: 200, description: 'Detalles obtenidos correctamente.' })
	@ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
	@ApiResponse({ status: 404, description: 'Detalles no encontrados.' })
	@ApiResponse({ status: 500, description: 'Error del servidor.' })
	@Auth(ValidRoles.administrador)
	async getDeliverymanStateDetails(@Param('year') year: string, @Param('month') month: string, @Param('day') day: string, @Res() res: Response) {
		try {
			const details = await this.reportsService.getDeliverymanStateDetails(year, month, day);
			res.json(details);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('packages/delivered/:year/:month/:day')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtener paquetes entregados', description: 'Obtiene los paquetes entregados en una fecha específica. Requiere rol de administrador.' })
	@ApiParam({ name: 'year', description: 'Año', type: String, example: '2023' })
	@ApiParam({ name: 'month', description: 'Mes', type: String, example: '04' })
	@ApiParam({ name: 'day', description: 'Día', type: String, example: '15' })
	@ApiQuery({ name: 'userId', description: 'OPCIONAL: Dejarlo vacío o UUID de repartidor', type: String, required: false, example: '550e8400-e29b-41d4-a716-446655440000' })
	@ApiResponse({ status: 200, description: 'Paquetes entregados obtenidos correctamente.' })
	@ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
	@ApiResponse({ status: 404, description: 'Paquetes no encontrados.' })
	@ApiResponse({ status: 500, description: 'Error del servidor.' })
	@Auth(ValidRoles.administrador)
	async getDeliveredPackages(@Param('year') year: string, @Param('month') month: string, @Param('day') day: string, @Query('userId') userId: string, @Res() res: Response) {
		try {
			const deliveredPackages = await this.reportsService.findDeliveredPackagesByDate(year, month, day, userId);
			res.json(deliveredPackages);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('packages/all/:year/:month/:day')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Obtener todos los paquetes para una fecha específica',
		description: 'Este endpoint permite a un administrador obtener todos los paquetes que están programados para una fecha específica.',
	})
	@ApiParam({ name: 'year', description: 'Año de la fecha deseada', type: String, example: '2024' })
	@ApiParam({ name: 'month', description: 'Mes de la fecha deseada', type: String, example: '03' })
	@ApiParam({ name: 'day', description: 'Día de la fecha deseada', type: String, example: '15' })
	@ApiResponse({ status: 200, description: 'Paquetes obtenidos correctamente.' })
	@ApiResponse({ status: 404, description: 'No se encontraron paquetes para la fecha especificada.' })
	@ApiResponse({ status: 500, description: 'Error interno del servidor.' })
	@Auth(ValidRoles.administrador)
	async getAllPackagesForDate(@Param('year') year: string, @Param('month') month: string, @Param('day') day: string, @Res() res: Response) {
		try {
			const packages = await this.reportsService.findAllPackagesByDate(year, month, day);
			res.json(packages);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}
}
