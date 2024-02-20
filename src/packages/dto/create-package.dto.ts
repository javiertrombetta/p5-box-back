import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePackageDto {
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	description: string;

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	deliveryAddress: string;

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@IsEnum({ pendiente: 'pendiente', en_camino: 'en camino', entregado: 'entregado' })
	state?: string;

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@IsUUID()
	deliveryMan?: string;
}
