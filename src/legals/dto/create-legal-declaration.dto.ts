import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { validationMessages } from '../../common/constants';

export class CreateLegalDeclarationDto {
	@IsNotEmpty({ message: validationMessages.legals.hasConsumedAlcohol.isNotEmpty })
	@IsBoolean({ message: validationMessages.legals.hasConsumedAlcohol.isBoolean })
	@ApiProperty({ description: validationMessages.swagger.legals.hasConsumedAlcohol, required: true })
	hasConsumedAlcohol: boolean;

	@IsNotEmpty({ message: validationMessages.legals.isUsingPsychoactiveDrugs.isNotEmpty })
	@IsBoolean({ message: validationMessages.legals.isUsingPsychoactiveDrugs.isBoolean })
	@ApiProperty({ description: validationMessages.swagger.legals.isUsingPsychoactiveDrugs, required: true })
	isUsingPsychoactiveDrugs: boolean;

	@IsNotEmpty({ message: validationMessages.legals.hasEmotionalDistress.isNotEmpty })
	@IsBoolean({ message: validationMessages.legals.hasEmotionalDistress.isBoolean })
	@ApiProperty({ description: validationMessages.swagger.legals.hasEmotionalDistress, required: true })
	hasEmotionalDistress: boolean;
}
