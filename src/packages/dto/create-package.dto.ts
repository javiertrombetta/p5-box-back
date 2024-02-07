import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePackageDto {
    @IsNotEmpty()//decoradores de validación
    @IsString()
    description: string;

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
