import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class CreatePackageDto {
	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	deliveryFullname: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	deliveryAddress: string;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	@ApiProperty()
	deliveryWeight: number;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	deliveryDate: string;
}
