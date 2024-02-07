import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Matches, MinLength, ValidateNested } from 'class-validator';
import { validationMessages } from '../../common/constants/validation-messages.constants';

export class CreateUserDto {
	@IsNotEmpty({ message: validationMessages.user.name.isNotEmpty })
	@IsString({ message: validationMessages.user.name.isString })
	name: string;

	@IsNotEmpty({ message: validationMessages.user.lastname.isNotEmpty })
	@IsString({ message: validationMessages.user.lastname.isString })
	lastname: string;

	@IsNotEmpty({ message: validationMessages.user.email.isNotEmpty })
	@IsEmail({}, { message: validationMessages.user.email.isEmail })
	email: string;

	@IsNotEmpty({ message: validationMessages.user.password.isNotEmpty })
	@IsString({ message: validationMessages.user.password.isString })
	@MinLength(6, { message: validationMessages.user.password.minLength })
	@Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: validationMessages.user.password.pattern,
	})
	password: string;

	@IsOptional()
	@IsNotEmpty({ message: validationMessages.user.role.isNotEmpty })
	@IsString({ message: validationMessages.user.role.isString })
	@IsEnum(['repartidor', 'administrador'], { message: validationMessages.user.role.isEnum })
	role?: string;

	@IsOptional()
	@IsArray({ message: validationMessages.user.packages.isArray })
	@ValidateNested({ each: true })
	@Type(() => String)
	packages?: string[];

	@IsOptional()
	@IsString({ message: validationMessages.user.state.isEnum })
	@IsEnum({ active: 'active', inactive: 'inactive' }, { message: validationMessages.user.state.isEnum })
	state?: string;

	@IsOptional()
	@IsNumber({}, { message: validationMessages.user.points.isNumber })
	@IsPositive({ message: validationMessages.user.points.isPositive })
	points?: number;
}
