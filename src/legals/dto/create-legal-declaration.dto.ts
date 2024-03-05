import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { validationMessages } from '../../common/constants';

export class CreateLegalDeclarationDto {
	@IsNotEmpty()
	@IsBoolean()
	@ApiProperty({ description: validationMessages.swagger.legals.hasConsumedAlcohol, required: true })
	hasConsumedAlcohol: boolean;

	@IsNotEmpty()
	@IsBoolean()
	@ApiProperty({ description: validationMessages.swagger.legals.isUsingPsychoactiveDrugs, required: true })
	isUsingPsychoactiveDrugs: boolean;

	@IsNotEmpty()
	@IsBoolean()
	@ApiProperty({ description: validationMessages.swagger.legals.hasEmotionalDistress, required: true })
	hasEmotionalDistress: boolean;
}
