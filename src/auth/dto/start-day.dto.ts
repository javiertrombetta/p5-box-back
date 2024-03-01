import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartDayDto {
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, { each: true })
	@ApiProperty()
	packages: string[];
}
