import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { validationMessages } from '../../common/constants';

export class CreatePackageDto {
	@IsNotEmpty()
	@IsString()
	@ApiProperty({ description: validationMessages.swagger.packages.deliveryFullname, required: true })
	deliveryFullname: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty({ description: validationMessages.swagger.packages.deliveryAddress, required: true })
	deliveryAddress: string;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	@ApiProperty({ description: validationMessages.swagger.packages.deliveryWeight, required: true })
	deliveryWeight: number;

	@IsNotEmpty()
	@IsString()
	@ApiProperty({ description: validationMessages.swagger.packages.deliveryDate, required: true })
	deliveryDate: string;
}
