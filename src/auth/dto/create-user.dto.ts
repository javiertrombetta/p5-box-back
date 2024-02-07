import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Matches, MinLength, ValidateNested } from 'class-validator';

export class CreateUserDto {
	@IsNotEmpty()
	@IsString()
	fullName: string;

	@IsNotEmpty()
	@IsString()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(6)
	@Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: 'La contraseña tiene que tener una letra mayúscula, una letra minúscula y un número.',
	})
	password: string;

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@IsEnum(['repartidor', 'administrador'])
	role?: string;

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => String)
	packages?: string[];

	@IsOptional()
	@IsString()
	@IsEnum({ active: 'active', inactive: 'inactive' })
	state?: string;

	@IsOptional()
	@IsNumber()
	@IsPositive()
	points?: number;
}
