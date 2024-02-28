import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

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
	@ApiProperty()
	deliveryWeight: number;

	@IsNotEmpty()
	@IsDate()
	@ApiProperty()
	daliveryDate: Date;

	@IsOptional()
	@IsString()
	@IsUUID()
	deliveryMan?: string;

	@IsOptional()
	@IsString()
	@IsEnum({ disponible: 'disponible', pendiente: 'pendiente', en_curso: 'en curso', entregado: 'entregado' })
	state?: string;
}
