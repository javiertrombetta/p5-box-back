import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePackageDto {
	@IsNotEmpty()
	@IsString()
	description: string;

	@IsNotEmpty()
	@IsString()
	deliveryAddress: string;

	@IsNotEmpty()
	@IsString()
	@IsEnum({ pendiente: 'pendiente', en_camino: 'en camino', entregado: 'entregado' })
	state: string;

	@IsString()
	@IsUUID()
	deliveryMan: string;
}
