import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { LogService } from '../log/log.service';
import { PackagesService } from '../packages/packages.service';
import { AuthService } from '../auth/auth.service';
import { validationMessages } from '../common/constants';
import { ValidRoles } from '../auth/interfaces';

@Injectable()
export class ReportsService {
	constructor(
		@Inject(forwardRef(() => LogService)) private logService: LogService,
		@Inject(forwardRef(() => PackagesService)) private packagesService: PackagesService,
		@Inject(forwardRef(() => AuthService)) private authService: AuthService,
	) {}

	async getAvailableDeliverymanReport(year: string, month: string, day: string) {
		const date = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

		const { activeUsers, inactiveUsers } = await this.logService.getLastStateOfUsersUntilDate(date, ValidRoles.repartidor);
		const totalUsersCount = await this.authService.countDeilverymanRegisteredBeforeDate(date);
		const usersWithLogsCount = await this.logService.countUsersWithStateLogsUntilDate(date);

		const usersWithoutLogsCount = totalUsersCount - usersWithLogsCount;
		const adjustedActiveUsers = activeUsers + usersWithoutLogsCount;

		return {
			date: date.toISOString().split('T')[0],
			activeUsers: adjustedActiveUsers,
			inactiveUsers: inactiveUsers,
			totalUsers: totalUsersCount,
		};
	}

	async getDeliverymanStateDetails(year: string, month: string, day: string) {
		const date = new Date(`${year}-${month}-${day}T23:59:59.999Z`);
		return this.logService.getStateDetailsOfUsersUntilDate(date, ValidRoles.repartidor);
	}

	async findDeliveredPackagesAddresses(userId?: string): Promise<any> {
		return this.packagesService.findPackagesByCriteria(undefined, undefined, undefined, userId, true);
	}

	async findDeliveredPackagesByDate(year: string, month: string, day: string, userId?: string): Promise<any> {
		if (userId) {
			const user = await this.authService.findById(userId);
			if (!user) {
				throw new HttpException(validationMessages.auth.account.error.userNotFound, HttpStatus.UNAUTHORIZED);
			}
		}

		const deliveredPackages = await this.packagesService.findPackagesByCriteria(year, month, day, userId);

		if (deliveredPackages.length === 0) {
			throw new HttpException(validationMessages.reports.packagesNotFound, HttpStatus.NOT_FOUND);
		}

		return deliveredPackages;
	}

	async findAllPackagesByDate(year: string, month: string, day: string): Promise<any> {
		const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));

		const packages = await this.packagesService.findPackagesByDateAndOptionalState(date);

		if (packages.length === 0) {
			throw new HttpException(validationMessages.reports.packagesNotFound, HttpStatus.NOT_FOUND);
		}

		return packages;
	}

	async getDeliverymanDeliveryPercentage(year: string, month: string, day: string, deliverymanId: string): Promise<any> {
		const dateStart = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
		const dateEnd = new Date(dateStart);
		dateEnd.setDate(dateStart.getDate() + 1);

		const hadPackagesAssignedOrCancelled = await this.logService.hadAssignedOrCancelledPackages(dateStart, dateEnd, deliverymanId);
		const deliveredPackagesCount = await this.packagesService.countDeliveredPackagesByDateAndDeliveryman(year, month, day, deliverymanId);

		const totalPackages = 10;
		let percentage = 0;

		if (deliveredPackagesCount > 0) {
			percentage = (deliveredPackagesCount / totalPackages) * 100;
		} else if (!hadPackagesAssignedOrCancelled) {
			throw new HttpException(validationMessages.reports.noPackagesTaken, HttpStatus.NOT_FOUND);
		}

		return { percentage };
	}
}
