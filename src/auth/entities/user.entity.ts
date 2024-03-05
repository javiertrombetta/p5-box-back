import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as mongooseUniqueValidator from 'mongoose-unique-validator';
import { validationMessages } from '../../common/constants/validation-messages.constants';
import { ApiProperty } from '@nestjs/swagger';
import { ValidRoles } from '../interfaces';

@Schema({ timestamps: true })
export class User extends mongoose.Document {
	@Prop({ type: String, default: () => uuidv4() })
	_id: string;

	@Prop({ required: true })
	name: string;

	@Prop({ required: true })
	lastname: string;

	@Prop({ required: true, unique: true, lowercase: true })
	email: string;

	@Prop({ required: true })
	password: string;

	@Prop({ required: false })
	resetPasswordToken: string;

	@Prop({ required: false })
	resetPasswordExpires: Date;

	@Prop({
		type: [{ type: String, enum: [ValidRoles.repartidor, ValidRoles.administrador] }],
		default: [ValidRoles.repartidor],
	})
	roles: string[];

	@Prop({ type: [{ type: String, ref: validationMessages.mongoose.packages }] })
	@ApiProperty()
	packages: string[];

	@Prop({ type: Buffer, required: false })
	photoUrl: Buffer;

	@Prop({ default: validationMessages.auth.user.state.isActiveState, enum: [validationMessages.auth.user.state.isActiveState, validationMessages.auth.user.state.isInactiveSate] })
	state: string;

	@Prop({ default: 0 })
	points: number;

	@Prop({ default: null })
	blockUntil: Date;

	@Prop({ default: 0 })
	@ApiProperty()
	consecutiveDeliveries: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.plugin(mongooseUniqueValidator, {
	message: validationMessages.auth.mongoose.unique,
});
