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
	nombre: string;

	@Prop({ required: true, unique: true })
	email: string;

	@Prop({ required: true })
	contrasena: string;

	@Prop({ required: true, enum: ['repartidor', 'administrador'] })
	rol: string;

	@Prop({ type: [{ type: String, ref: 'Package' }] })
	paquetesAsignados: string[];

	@Prop({ default: 'activo' })
	estado: string;

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
	geolocalizacion: {
		type: string;
		coordinates: number[];
	};

	@Prop({ default: 0 })
	puntos: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ geolocalizacion: '2dsphere' });
UserSchema.plugin(mongooseUniqueValidator, { message: 'El {PATH} tiene que ser único.' });
