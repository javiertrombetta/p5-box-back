import { IsArray, ArrayNotEmpty, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { validationMessages } from '../../common/constants';

export class StartDayDto {
	@IsArray({ message: validationMessages.packages.userArray.isArray })
	@ArrayNotEmpty({ message: validationMessages.packages.userArray.isNotEmpty })
	@IsUUID(4, { each: true, message: validationMessages.packages.userArray.isUUID })
	@ApiProperty({ description: validationMessages.swagger.user.packages, required: true })
	packages: string[];

	@IsBoolean({ message: validationMessages.legals.hasConsumedAlcohol.isBoolean })
	@ApiProperty({ description: validationMessages.swagger.legals.hasConsumedAlcohol })
	hasConsumedAlcohol: boolean;

	@IsBoolean({ message: validationMessages.legals.isUsingPsychoactiveDrugs.isBoolean })
	@ApiProperty({ description: validationMessages.swagger.legals.isUsingPsychoactiveDrugs })
	isUsingPsychoactiveDrugs: boolean;

	@IsBoolean({ message: validationMessages.legals.hasEmotionalDistress.isBoolean })
	@ApiProperty({ description: validationMessages.swagger.legals.hasEmotionalDistress })
	hasEmotionalDistress: boolean;
}
