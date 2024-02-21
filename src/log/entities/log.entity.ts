import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: false })
export class Log extends mongoose.Document {
	@Prop({ type: String, default: () => uuidv4() })
	_id: string;

	@Prop({ type: Date, default: () => new Date() })
	timestamp: Date;

	@Prop({ required: true })
	action: string;

	@Prop({ required: true })
	entity: string;

	@Prop({ required: true })
	entityId: string;

	@Prop({ required: true, type: mongoose.Schema.Types.Mixed })
	changes: any;

	@Prop({ required: true })
	performedBy: string;
}

export const LogSchema = SchemaFactory.createForClass(Log);
