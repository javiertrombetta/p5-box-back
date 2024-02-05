import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as mongooseUniqueValidator from 'mongoose-unique-validator';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
	@Prop({ type: String, default: () => uuidv4() })
	_id: string;

	@Prop({ required: true })
	fullName: string;

	@Prop({ required: true, unique: true })
	email: string;

	@Prop({ required: true })
	password: string;

	@Prop({ required: true, enum: ['repartidor', 'administrador'] })
	role: string;

	@Prop({ type: [{ type: String, ref: 'Package' }] })
	packages: string[];

	@Prop({ default: 'active', enum: ['active', 'inactive'] })
	state: string;

	@Prop({
		type: {
			type: String,
			enum: ['Point'],
			default: 'Point',
		},
		coordinates: {
			type: [Number],
			index: '2dsphere',
		},
	})
	geolocation: {
		type: string;
		coordinates: number[];
	};

	@Prop({ default: 0 })
	points: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ geolocation: '2dsphere' });
UserSchema.plugin(mongooseUniqueValidator, { message: 'El {PATH} tiene que ser único.' });
