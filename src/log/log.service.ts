import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Log } from './entities';
import { CreateLogDto } from './dto/create-log.dto';
import { validationMessages } from 'src/common/constants';

@Injectable()
export class LogService {
	constructor(@InjectModel(Log.name) private readonly logModel: Model<Log>) {}

	async create(createLogDto: CreateLogDto): Promise<Log> {
		const newLog = new this.logModel(createLogDto);
		return newLog.save();
	}

	async findAll(): Promise<Log[]> {
		return this.logModel.find().exec();
	}

	async getLastStateOfUsers(startDate: Date, endDate: Date): Promise<{ activeUsers: number; inactiveUsers: number }> {
		const aggregationPipeline = [
			{
				$match: {
					timestamp: { $gte: startDate, $lte: endDate },
					action: { $in: [validationMessages.log.action.user.state.activate, validationMessages.log.action.user.state.deactivate] },
				},
			},
			{
				$sort: { timestamp: -1 as const },
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
			if (result._id === 'userActivated') {
				activeUsers = result.count;
			} else if (result._id === 'userDeactivated') {
				inactiveUsers = result.count;
			}
		});

		return { activeUsers, inactiveUsers };
	}

	async getStateDetailsOfUsers(startDate: Date, endDate: Date): Promise<any> {
		const aggregationPipeline: any = [
			{
				$match: {
					timestamp: { $gte: startDate, $lte: endDate },
					action: { $in: [validationMessages.log.action.user.state.activate, validationMessages.log.action.user.state.deactivate] },
				},
			},
			{ $sort: { timestamp: -1 } },
			{
				$group: {
					_id: '$entityId',
					lastAction: { $first: '$action' },
					lastTimestamp: { $first: '$timestamp' },
				},
			},
			{
				$lookup: {
					from: validationMessages.log.entity.user,
					localField: '_id',
					foreignField: '_id',
					as: 'userDetails',
				},
			},
			{ $unwind: '$userDetails' },
			{
				$project: {
					_id: 0,
					name: '$userDetails.name',
					lastname: '$userDetails.lastname',
					lastState: '$lastAction',
				},
			},
		];

		return this.logModel.aggregate(aggregationPipeline);
	}
}
