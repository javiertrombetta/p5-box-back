import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePackageDto {
	@IsOptional()//lo agregue
    @IsNotEmpty()//decoradores de validación
    @IsString()
    description: string;

	@IsOptional()//lo agregue
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
