import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Matches, MinLength, ValidateNested } from 'class-validator';
import { validationMessages } from '../../common/constants/validation-messages.constants';

export class CreateUserDto {
	@IsNotEmpty({ message: validationMessages.auth.name.isNotEmpty })
	@IsString({ message: validationMessages.auth.name.isString })
	name: string;

	@IsNotEmpty({ message: validationMessages.auth.lastname.isNotEmpty })
	@IsString({ message: validationMessages.auth.lastname.isString })
	lastname: string;

	@IsNotEmpty({ message: validationMessages.auth.email.isNotEmpty })
	@IsEmail({}, { message: validationMessages.auth.email.isEmail })
	email: string;

	@IsNotEmpty({ message: validationMessages.auth.password.isNotEmpty })
	@IsString({ message: validationMessages.auth.password.isString })
	@MinLength(6, { message: validationMessages.auth.password.minLength })
	@Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: validationMessages.auth.password.pattern,
	})
	password: string;

	@IsOptional()
	@IsArray({ message: validationMessages.auth.role.isArray })
	@IsEnum(['repartidor', 'administrador'], {
		each: true,
		message: validationMessages.auth.role.isEnum,
	})
	roles?: string[];

	@IsOptional()
	@IsArray({ message: validationMessages.auth.packages.isArray })
	@ValidateNested({ each: true })
	@Type(() => String)
	packages?: string[];

	@IsOptional()
	@IsString({ message: validationMessages.auth.photoUrl.isString })
	photoUrl?: string;

	@IsOptional()
	@IsString({ message: validationMessages.auth.state.isEnum })
	@IsEnum({ active: 'active', inactive: 'inactive' }, { message: validationMessages.auth.state.isEnum })
	state?: string;

	@IsOptional()
	@IsNumber({}, { message: validationMessages.auth.points.isNumber })
	@IsPositive({ message: validationMessages.auth.points.isPositive })
	points?: number;
}
