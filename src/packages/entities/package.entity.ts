import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as mongooseUniqueValidator from 'mongoose-unique-validator';

@Schema({ timestamps: true })
export class Package extends Document {
	@Prop({ type: String, default: () => uuidv4() })
	_id: string;

	@Prop({ required: true })
	deliveryFullname: string;

	@Prop({ required: true })
	deliveryAddress: string;

	@Prop({ required: true })
	deliveryWeight: number;

	@Prop()
	daliveryDate: Date;

	@Prop({ type: String, ref: 'User' })
	deliveryMan: string;

	@Prop({ required: true, default: 'disponible', enum: ['pendiente', 'disponible', 'en curso', 'entregado', 'sin entregar'] })
	state: string;
}
export const PackageSchema = SchemaFactory.createForClass(Package);
PackageSchema.plugin(mongooseUniqueValidator, { message: 'El {PATH} tiene que ser único.' });
