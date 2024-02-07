import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as mongooseUniqueValidator from 'mongoose-unique-validator';

@Schema({ timestamps: true })
export class User extends Document {
	@Prop({ type: String, default: () => uuidv4() })
	_id: string;

	@Prop({ required: true })
	name: string;

	@Prop({ required: true })
	lastname: string;

	@Prop({ required: true, unique: true })
	email: string;

	@Prop({ required: true })
	password: string;

	@Prop({ default: 'repartidor', enum: ['repartidor', 'administrador'] })
	role: string;

	@Prop({ type: [{ type: String, ref: 'Package' }] })
	packages: string[];

	@Prop({ default: 'active', enum: ['active', 'inactive'] })
	state: string;

	@Prop({ default: 0 })
	points: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(mongooseUniqueValidator, { message: 'El {PATH} tiene que ser único.' });
