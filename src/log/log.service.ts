// src/logs/log.service.ts
import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Log } from './entities';
import { CreateLogDto } from './dto/create-log.dto';

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
}
