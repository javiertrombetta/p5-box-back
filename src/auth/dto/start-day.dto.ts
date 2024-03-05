import { IsArray, ArrayNotEmpty, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { validationMessages } from '../../common/constants';

export class StartDayDto {
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, { each: true })
	@ApiProperty({ description: validationMessages.swagger.user.packages, required: true })
	packages: string[];

	@IsBoolean()
	@ApiProperty({ description: 'Declaración jurada de consumo de alcohol' })
	hasConsumedAlcohol: boolean;

	@IsBoolean()
	@ApiProperty({ description: 'Declaración jurada de uso de drogas psicoactivas' })
	isUsingPsychoactiveDrugs: boolean;

	@IsBoolean()
	@ApiProperty({ description: 'Declaración jurada de estrés emocional' })
	hasEmotionalDistress: boolean;
}
