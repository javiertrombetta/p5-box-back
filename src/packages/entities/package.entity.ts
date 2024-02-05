import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as mongooseUniqueValidator from 'mongoose-unique-validator';

export type PackageDocument = Package & Document;

@Schema({ timestamps: true })
export class Package {
	@Prop({ type: String, default: () => uuidv4() })
	_id: string;

	@Prop({ required: true })
	descripcion: string;

	@Prop({ required: true })
	direccionEntrega: string;

	@Prop({ required: true, enum: ['pendiente', 'en camino', 'entregado'] })
	estado: string;

	@Prop({ type: String, ref: 'User' })
	repartidorAsignado: string;
}

export const PackageSchema = SchemaFactory.createForClass(Package);
PackageSchema.plugin(mongooseUniqueValidator, { message: 'El {PATH} tiene que ser único.' });
