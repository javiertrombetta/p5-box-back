import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, IsUUID, Validate } from 'class-validator';
import { CreatePackageDto } from './create-package.dto';
import { validationMessages } from '../../common/constants';

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
	@IsNotEmpty({ message: validationMessages.auth.user.name.isNotEmpty })
	@IsString({ message: validationMessages.auth.user.name.isString })
	description?: string;

	@IsOptional()
	@IsNotEmpty({ message: validationMessages.packages.error.packageNotFound })
	@IsString()
	deliveryAddress?: string;

	@IsOptional()
	@IsNotEmpty()
	@Validate(StateValidator, { message: validationMessages.packages.state.dto })
	state?: string;

	@IsOptional()
	@IsNotEmpty()
	@IsUUID()
	@IsString()
	deliveryMan?: string;
}
