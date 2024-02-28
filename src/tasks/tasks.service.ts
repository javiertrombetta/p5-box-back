import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PackagesService } from '../packages/packages.service';
import { AuthService } from '../auth/auth.service';
import { LogService } from '../log/log.service';
import { validationMessages } from '../common/constants';

@Injectable()
export class TasksService {
	constructor(
		private packagesService: PackagesService,
		private authService: AuthService,
		private logService: LogService,
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async handleCron() {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const packages = await this.packagesService.findAllPackagesWithDeliveryMan();
		for (const pkg of packages) {
			await this.packagesService.updatePackageState(pkg._id, validationMessages.packages.state.available);
			await this.logService.create({
				action: validationMessages.log.action.packages.state.toAvailable,
				entity: validationMessages.log.entity.package,
				entityId: pkg._id,
				changes: { state: pkg.state },
				performedBy: 'CRON',
			});

			await this.packagesService.clearPackageDeliveryMan(pkg._id);
			await this.packagesService.updatePackageDeliveryDate(pkg._id, new Date());
			await this.logService.create({
				action: validationMessages.log.action.packages.deliveryDate.nextDate,
				entity: validationMessages.log.entity.package,
				entityId: pkg._id,
				changes: { deliveryDate: today },
				performedBy: 'CRON',
			});
		}

		await this.packagesService.updateDeliveryDateForNonDeliveredPackages(today);

		const users = await this.authService.findAllUsersWithPackages();
		for (const user of users) {
			await this.authService.clearUserPackages(user._id);
		}
	}
}
