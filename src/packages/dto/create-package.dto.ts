import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePackageDto {
	@IsNotEmpty()
	@IsString()
	deliveryFullname: string;

	@IsNotEmpty()
	@IsString()
	deliveryAddress: string;

	@IsNotEmpty()
	@IsNumber()
	deliveryWeight: number;

	@IsNotEmpty()
	@IsDate()
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
