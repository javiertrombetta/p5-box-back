import { IsDate, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateLogDto {
	@IsNotEmpty()
	@IsDate()
	timestamp?: Date;

	@IsNotEmpty()
	@IsString()
	action: string;

	@IsNotEmpty()
	@IsString()
	entity: string;

	@IsNotEmpty()
	@IsString()
	entityId: string;

	@IsNotEmpty()
	@IsObject()
	changes: any;

	@IsNotEmpty()
	@IsString()
	performedBy: string;
}
