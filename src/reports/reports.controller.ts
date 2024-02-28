import { Controller, Get, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
	constructor(private readonly reportsService: ReportsService) {}

	@Get('deliveryman/all/state/available/:year/:month/:day')
	@Auth(ValidRoles.administrador)
	async getReport(@Param('year') year: string, @Param('month') month: string, @Param('day') day: string) {
		return this.reportsService.getAvailableDeliverymanReport(year, month, day);
	}

	@Get('deliveryman/all/state/details/:year/:month/:day')
	@Auth(ValidRoles.administrador)
	async getDeliverymanStateDetails(@Param('year') year: string, @Param('month') month: string, @Param('day') day: string) {
		return this.reportsService.getDeliverymanStateDetails(year, month, day);
	}

	@Get('/on/all/delivered/:year/:month/:day')
	@Auth(ValidRoles.administrador)
	async getDeliveredPackages(@Param('year') year: string, @Param('month') month: string, @Param('day') day: string) {
		return this.reportsService.findDeliveredPackagesByDate(year, month, day);
	}

	@Get('/deliveryman/on/:uuidUser/delivered/:year/:month/:day')
	@Auth(ValidRoles.administrador)
	async getDeliveredPackagesByDeliverymanAndDate(@Param('uuidUser') uuidUser: string, @Param('year') year: string, @Param('month') month: string, @Param('day') day: string) {
		return this.reportsService.findDeliveredPackagesByDeliverymanAndDate(year, month, day, uuidUser);
	}

	@Get('packages/all/:year/:month/:day')
	@Auth(ValidRoles.administrador)
	async getAllPackagesForDate(@Param('year') year: string, @Param('month') month: string, @Param('day') day: string) {
		return this.reportsService.findAllPackagesByDate(year, month, day);
	}
}
