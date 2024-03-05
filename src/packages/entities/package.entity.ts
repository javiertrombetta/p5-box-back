import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as mongooseUniqueValidator from 'mongoose-unique-validator';
import { validationMessages } from '../../common/constants';

@Schema({ timestamps: true })
export class Package extends mongoose.Document {
	@Prop({ type: String, default: () => uuidv4() })
	_id: string;

	@Prop({ required: true })
	deliveryFullname: string;

	@Prop({ required: true })
	deliveryAddress: string;

	@Prop({ required: true })
	deliveryWeight: number;

	@Prop()
	deliveryDate: Date;

	@Prop({ type: String, ref: validationMessages.mongoose.users })
	deliveryMan: string;

	@Prop({
		required: true,
		default: validationMessages.packages.state.available,
		enum: [
			validationMessages.packages.state.pending,
			validationMessages.packages.state.available,
			validationMessages.packages.state.onTheWay,
			validationMessages.packages.state.delivered,
		],
	})
	state: string;
}
export const PackageSchema = SchemaFactory.createForClass(Package);
PackageSchema.plugin(mongooseUniqueValidator, { message: 'El {PATH} tiene que ser único.' });
