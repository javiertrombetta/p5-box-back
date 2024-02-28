import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { LogService } from '../log/log.service';
import { PackagesService } from '../packages/packages.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ReportsService {
	constructor(
		@Inject(forwardRef(() => LogService)) private logService: LogService,
		@Inject(forwardRef(() => PackagesService)) private packagesService: PackagesService,
		@Inject(forwardRef(() => AuthService)) private authService: AuthService,
	) {}

	async getAvailableDeliverymanReport(year: string, month: string, day: string) {
		const startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
		const endDate = new Date(`${year}-${month}-${day}T23:59:59.999Z`);
		const { activeUsers, inactiveUsers } = await this.logService.getLastStateOfUsers(startDate, endDate);

		const usersWithLogs = await this.logService.getUsersWithStateLogs();

		const totalUsersCount = await this.authService.countUsers();
		const usersWithoutLogsCount = totalUsersCount - usersWithLogs.length;

		const adjustedActiveUsers = activeUsers + usersWithoutLogsCount;

		return {
			activeUsers: adjustedActiveUsers,
			inactiveUsers,
		};
	}

	async getDeliverymanStateDetails(year: string, month: string, day: string) {
		const startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
		const endDate = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

		return this.logService.getStateDetailsOfUsers(startDate, endDate);
	}

	async findDeliveredPackagesByDate(year: string, month: string, day: string): Promise<any> {
		return this.packagesService.findPackagesByCriteria(year, month, day);
	}

	async findDeliveredPackagesByDeliverymanAndDate(uuidUser: string, year: string, month: string, day: string): Promise<any> {
		return this.packagesService.findPackagesByCriteria(year, month, day, uuidUser);
	}

	async findAllPackagesByDate(year: string, month: string, day: string): Promise<any> {
		return this.packagesService.findPackagesByCriteria(year, month, day, undefined, true);
	}
}
