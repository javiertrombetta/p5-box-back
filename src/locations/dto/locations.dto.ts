import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { validationMessages } from '../../common/constants';

export class LocationDto {
	@ApiProperty({ example: 37.7749, description: validationMessages.swagger.locations.latitude })
	@IsNotEmpty()
	@IsNumber()
	latitude: number;

	@ApiProperty({ example: -122.4194, description: validationMessages.swagger.locations.longitude })
	@IsNotEmpty()
	@IsNumber()
	longitude: number;
}
