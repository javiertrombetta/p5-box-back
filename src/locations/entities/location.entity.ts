import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Location extends Document {
	@Prop({ type: String, default: () => uuidv4() })
	@ApiProperty()
	_id: string;

	@Prop({ type: String, required: true })
	@ApiProperty({ type: String, description: 'El ID del usuario que tiene esta ubicación.' })
	userId: string;

	@Prop({ required: true })
	@ApiProperty({ example: 37.7749, description: 'Latitud de una ubicación.' })
	latitude: number;

	@Prop({ required: true })
	@ApiProperty({ example: -122.4194, description: 'Longitud de una ubicación.' })
	longitude: number;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
