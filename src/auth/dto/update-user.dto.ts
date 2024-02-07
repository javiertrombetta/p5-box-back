import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { CreateUserDto } from './';

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	lastname?: string;

	@IsOptional()
	@IsString()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	@MinLength(6)
	@MaxLength(50)
	@Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: 'La contraseña tiene que tener una letra mayúscula, una letra minúscula y un número.',
	})
	password?: string;

	@IsOptional()
	@IsString()
	@IsEnum(['repartidor', 'administrador'])
	role?: string;
}
