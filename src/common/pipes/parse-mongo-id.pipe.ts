/* eslint-disable @typescript-eslint/no-unused-vars */
import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import * as mongoose from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
	transform(value: string, metadata: ArgumentMetadata) {
		if (!mongoose.isValidObjectId(value)) {
			throw new BadRequestException(`${value} is not a valid MongoID`);
		}

		return value;
	}
}
