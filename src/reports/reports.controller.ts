import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { ApiTags } from '@nestjs/swagger';
import { ExceptionHandlerService } from '../common/helpers';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
	constructor(private readonly reportsService: ReportsService) {}

	@Get('deliveryman/all/state/totals/:year/:month/:day')
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
