import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsDate } from 'class-validator';
import { validationMessages } from '../../common/constants';
import { Type } from 'class-transformer';

export class CreatePackageDto {
	@IsNotEmpty({ message: validationMessages.packages.deliveryFullname.isNotEmpty })
	@IsString({ message: validationMessages.packages.deliveryFullname.isString })
	@ApiProperty({ description: validationMessages.swagger.packages.deliveryFullname, required: true })
	deliveryFullname: string;

	@IsNotEmpty({ message: validationMessages.packages.deliveryAddress.isNotEmpty })
	@IsString({ message: validationMessages.packages.deliveryAddress.isString })
	@ApiProperty({ description: validationMessages.swagger.packages.deliveryAddress, required: true })
	deliveryAddress: string;

	@IsNotEmpty({ message: validationMessages.packages.deliveryWeight.isNotEmpty })
	@IsNumber({}, { message: validationMessages.packages.deliveryWeight.isNumber })
	@Min(0, { message: validationMessages.packages.deliveryWeight.isMin })
	@ApiProperty({ description: validationMessages.swagger.packages.deliveryWeight, required: true })
	deliveryWeight: number;

	@IsNotEmpty({ message: validationMessages.packages.deliveryDate.isNotEmpty })
	@Type(() => Date)
	@IsDate({ message: validationMessages.packages.deliveryDate.isDate })
	@ApiProperty({ description: validationMessages.swagger.packages.deliveryDate, required: true, type: Date })
	deliveryDate: Date;
}
