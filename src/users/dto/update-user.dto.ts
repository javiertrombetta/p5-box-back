import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@IsOptional()
	@IsString()
	nombre?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@MinLength(6)
	contrasena?: string;

	@IsOptional()
	@IsEnum(['repartidor', 'administrador'])
	rol?: string;
}
