// src/packages/dto/update-package.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreatePackageDto } from './create-package.dto';

export class UpdatePackageDto extends PartialType(CreatePackageDto) {
	@IsOptional()
	@IsString()
	descripcion?: string;

	@IsOptional()
	@IsString()
	direccionEntrega?: string;

	@IsOptional()
	@IsEnum({ pendiente: 'pendiente', en_camino: 'en camino', entregado: 'entregado' })
	estado?: string;

	@IsOptional()
	@IsUUID()
	repartidorAsignado?: string;
}
