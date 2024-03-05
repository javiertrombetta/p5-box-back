import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PackagesService } from '../packages/packages.service';
import { AuthService } from '../auth/auth.service';
import { LogService } from '../log/log.service';
import { RewardsService } from '../rewards/rewards.service';
import { validationMessages } from '../common/constants';

@Injectable()
export class TasksService {
	constructor(
		private packagesService: PackagesService,
		private authService: AuthService,
		private logService: LogService,
		private rewardsService: RewardsService,
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async handleCron() {
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
				changes: { deliveryDate: new Date() },
				performedBy: 'CRON',
			});
		}

		const users = await this.authService.findAllUsersWithPackages();
		for (const user of users) {
			const undeliveredPackagesCount = user.packages.length;
			if (undeliveredPackagesCount > 0) {
				await this.rewardsService.subtractPointsForUndeliveredPackages(user._id.toString(), undeliveredPackagesCount);
			}
			await this.authService.clearUserPackages(user._id.toString());
		}

		const allUsers = await this.authService.findAll();

		for (const user of allUsers) {
			if (user.points < -100) {
				await this.authService.changeState(user._id.toString(), 'SYSTEM');

				await this.logService.create({
					action: validationMessages.log.action.user.state.deactivateByPoints,
					entity: validationMessages.log.entity.user,
					entityId: user._id.toString(),
					changes: {
						newState: validationMessages.auth.user.state.isInactiveSate,
					},
					performedBy: 'CRON',
				});
			}
		}

		await this.logService.create({
			action: validationMessages.log.action.cron,
			entity: validationMessages.log.entity.cron,
			entityId: validationMessages.log.entity.cron,
			changes: {},
			performedBy: 'CRON',
		});
	}
}
