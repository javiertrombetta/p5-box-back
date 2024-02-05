import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePackageDto {
	@IsNotEmpty()
	@IsString()
	descripcion: string;

	@IsNotEmpty()
	@IsString()
	direccionEntrega: string;

	@IsNotEmpty()
	@IsEnum({ pendiente: 'pendiente', en_camino: 'en camino', entregado: 'entregado' })
	estado: string;

	@IsNotEmpty()
	@IsUUID()
	repartidorAsignado: string;
}
