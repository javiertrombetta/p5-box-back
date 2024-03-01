import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class LocationDto {
	@ApiProperty({ example: 37.7749, description: 'Latitud de la ubicación.' })
	@IsNotEmpty()
	@IsNumber()
	latitude: number;

	@ApiProperty({ example: -122.4194, description: 'Longitud de la ubicación.' })
	@IsNotEmpty()
	@IsNumber()
	longitude: number;
}
