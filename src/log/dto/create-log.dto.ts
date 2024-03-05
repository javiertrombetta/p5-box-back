import { IsDate, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { validationMessages } from '../../common/constants';

export class CreateLogDto {
	@IsOptional()
	@IsNotEmpty({ message: validationMessages.log.timestamp.isNotEmpty })
	@Type(() => Date)
	@IsDate({ message: validationMessages.log.timestamp.isDate })
	@ApiProperty({ description: validationMessages.swagger.log.timestamp, required: false })
	timestamp?: Date;

	@IsNotEmpty({ message: validationMessages.log.action.isNotEmpty })
	@IsString({ message: validationMessages.log.action.isString })
	@ApiProperty({ description: validationMessages.swagger.log.action, required: true })
	action: string;

	@IsNotEmpty({ message: validationMessages.log.entity.isNotEmpty })
	@IsString({ message: validationMessages.log.entity.isString })
	@ApiProperty({ description: validationMessages.swagger.log.entity, required: true })
	entity: string;

	@IsNotEmpty({ message: validationMessages.log.entityId.isNotEmpty })
	@IsString({ message: validationMessages.log.entityId.isString })
	@ApiProperty({ description: validationMessages.swagger.log.entityId, required: true })
	entityId: string;

	@IsNotEmpty({ message: validationMessages.log.changes.isNotEmpty })
	@IsObject({ message: validationMessages.log.changes.isObject })
	@ApiProperty({ description: validationMessages.swagger.log.changes, required: true })
	changes: any;

	@IsNotEmpty({ message: validationMessages.log.performedBy.isNotEmpty })
	@IsString({ message: validationMessages.log.performedBy.isString })
	@ApiProperty({ description: validationMessages.swagger.log.performedBy, required: true })
	performedBy: string;
}
