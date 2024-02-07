// src/packages/dto/update-package.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreatePackageDto } from './create-package.dto';

export class UpdatePackageDto extends PartialType(CreatePackageDto) {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    deliveryAddress?: string;

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
