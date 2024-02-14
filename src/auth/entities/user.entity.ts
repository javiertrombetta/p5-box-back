import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as mongooseUniqueValidator from 'mongoose-unique-validator';
import { validationMessages } from '../../common/constants/validation-messages.constants';

@Schema({ timestamps: true })
export class User extends Document {
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

	@Prop({
		type: [{ type: String, enum: ['repartidor', 'administrador'] }],
		default: ['repartidor'],
	})
	roles: string[];

	@Prop({ type: [{ type: String, ref: 'Package' }] })
	packages: string[];

	@Prop({ default: 'activo', enum: ['activo', 'inactivo'] })
	state: string;

	@Prop({ default: 0 })
	points: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
	if (this.email) {
		this.email = this.email.toLowerCase().trim();
	}
	next();
});

UserSchema.plugin(mongooseUniqueValidator, {
	message: validationMessages.auth.mongoose.unique,
});
