// src/packages/dto/update-package.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreatePackageDto } from './create-package.dto';

export class UpdatePackageDto extends PartialType(CreatePackageDto) {
	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	deliveryAddress?: string;

	@IsOptional()
	@IsString()
	@IsEnum({ pendiente: 'pendiente', en_camino: 'en camino', entregado: 'entregado' })
	state?: string;

	@IsOptional()
	@IsString()
	@IsUUID()
	deliveryMan?: string;
}
