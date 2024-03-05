import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Validate } from 'class-validator';
import { CreatePackageDto } from './create-package.dto';
import { validationMessages } from '../../common/constants';
import { ApiProperty } from '@nestjs/swagger';

class StateValidator {
	validate(value: any) {
		const validStates = [
			validationMessages.packages.state.available,
			validationMessages.packages.state.pending,
			validationMessages.packages.state.onTheWay,
			validationMessages.packages.state.delivered,
		];
		return validStates.includes(value);
	}

	defaultMessage() {
		return validationMessages.packages.state.dto;
	}
}

export class UpdatePackageDto extends PartialType(CreatePackageDto) {
	@IsOptional()
	@IsNotEmpty({ message: validationMessages.packages.deliveryFullname.isNotEmpty })
	@IsString({ message: validationMessages.packages.deliveryFullname.isString })
	@ApiProperty({ description: validationMessages.swagger.packages.deliveryFullname, required: false })
	deliveryFullname?: string;

	@IsOptional()
	@IsNotEmpty({ message: validationMessages.packages.deliveryAddress.isNotEmpty })
	@IsString({ message: validationMessages.packages.deliveryAddress.isString })
	@ApiProperty({ description: validationMessages.swagger.packages.deliveryAddress, required: false })
	deliveryAddress?: string;

	@IsOptional()
	@IsNotEmpty({ message: validationMessages.packages.deliveryWeight.isNotEmpty })
	@IsNumber({}, { message: validationMessages.packages.deliveryWeight.isNumber })
	@ApiProperty({ description: validationMessages.swagger.packages.deliveryWeight, required: false })
	deliveryWeight?: number;

	@IsOptional()
	@IsNotEmpty({ message: validationMessages.packages.deliveryDate.isNotEmpty })
	@IsString({ message: validationMessages.packages.deliveryDate.isString })
	@ApiProperty({ description: validationMessages.swagger.packages.deliveryDate, required: false })
	deliveryDate?: string;

	@IsOptional()
	@IsNotEmpty({ message: validationMessages.packages.state.isNotEmpty })
	@Validate(StateValidator, { message: validationMessages.packages.state.dto })
	@ApiProperty({ description: validationMessages.swagger.packages.state, required: false })
	state?: string;

	@IsOptional()
	@IsNotEmpty({ message: validationMessages.packages.deliveryMan.isNotEmpty })
	@IsUUID('4', { message: validationMessages.packages.deliveryMan.isUUID })
	@ApiProperty({ description: validationMessages.swagger.packages.deliveryMan, required: false })
	deliveryMan?: string;
}
