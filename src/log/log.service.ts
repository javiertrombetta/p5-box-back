import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Log } from './entities';
import { CreateLogDto } from './dto/create-log.dto';
import { validationMessages } from '../common/constants';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class LogService {
	constructor(
		@InjectModel(Log.name) private readonly logModel: Model<Log>,
		@Inject(forwardRef(() => AuthService)) private authService: AuthService,
	) {}

	async create(createLogDto: CreateLogDto): Promise<Log> {
		const newLog = new this.logModel(createLogDto);
		return newLog.save();
	}

	async findAll(): Promise<Log[]> {
		return this.logModel.find().exec();
	}

	async getLastStateOfUsersUntilDate(date: Date, role: string): Promise<{ activeUsers: number; inactiveUsers: number }> {
		const aggregationPipeline: any = [
			{
				$match: {
					timestamp: { $lte: date },
					action: { $in: [validationMessages.log.action.user.state.activate, validationMessages.log.action.user.state.deactivate] },
					entity: validationMessages.log.entity.user,
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'entityId',
					foreignField: '_id',
					as: 'user',
				},
			},
			{
				$match: {
					'user.roles': role,
				},
			},
			{
				$sort: { timestamp: -1 },
			},
			{
				$group: {
					_id: '$entityId',
					lastAction: { $first: '$action' },
				},
			},
			{
				$group: {
					_id: '$lastAction',
					count: { $sum: 1 },
				},
			},
		];

		const results = await this.logModel.aggregate(aggregationPipeline);

		let activeUsers = 0;
		let inactiveUsers = 0;

		results.forEach(result => {
			if (result._id === validationMessages.log.action.user.state.activate) {
				activeUsers = result.count;
			} else if (result._id === validationMessages.log.action.user.state.deactivate) {
				inactiveUsers = result.count;
			}
		});

		return { activeUsers, inactiveUsers };
	}

	async countUsersWithStateLogsUntilDate(date: Date): Promise<number> {
		const aggregationPipeline = [
			{
				$match: {
					timestamp: { $lte: date },
					action: { $in: [validationMessages.log.action.user.state.activate, validationMessages.log.action.user.state.deactivate] },
					entity: validationMessages.log.entity.user,
				},
			},
			{
				$group: {
					_id: '$entityId',
				},
			},
			{
				$count: 'totalUsersWithLogs',
			},
		];

		const result = await this.logModel.aggregate(aggregationPipeline);

		if (result.length > 0) {
			return result[0].totalUsersWithLogs;
		} else {
			return 0;
		}
	}

	async getStateDetailsOfUsersUntilDate(date: Date, role: string): Promise<any> {
		const users = await this.authService.findUsersBeforeDate(date, role);
		const userIds = users.map(user => user._id);

		const logs = await this.logModel
			.find({
				entityId: { $in: userIds },
				timestamp: { $lte: date },
				action: { $in: [validationMessages.log.action.user.state.activate, validationMessages.log.action.user.state.deactivate] },
			})
			.sort({ timestamp: -1 })
			.exec();

		const userStates = {};
		logs.forEach(log => {
			if (!userStates[log.entityId]) {
				userStates[log.entityId] =
					log.action === validationMessages.log.action.user.state.activate ? validationMessages.auth.user.state.isActiveState : validationMessages.auth.user.state.isInactiveSate;
			}
		});

		const details = userIds.map(userId => ({
			userId,
			state: userStates[userId] || validationMessages.auth.user.state.isActiveState,
		}));

		return details;
	}

	async hadAssignedOrCancelledPackages(dateStart: Date, dateEnd: Date, deliverymanId: string): Promise<boolean> {
		const logs = await this.logModel
			.find({
				'changes.deliveryMan': deliverymanId,
				entity: validationMessages.log.entity.package,
				timestamp: { $gte: dateStart, $lt: dateEnd },
				action: { $in: [validationMessages.log.action.packages.assignPkgToUser, validationMessages.log.action.packages.updateOnCancel] },
			})
			.exec();

		const assignLogs = logs.filter(log => log.action === validationMessages.log.action.packages.assignPkgToUser);
		const cancelLogs = logs.filter(log => log.action === validationMessages.log.action.packages.updateOnCancel);

		return assignLogs.length > 0 && cancelLogs.length > 0;
	}
}
