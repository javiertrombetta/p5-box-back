import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Matches, MinLength, ValidateNested } from 'class-validator';
import { validationMessages } from '../../common/constants/validation-messages.constants';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
	@IsNotEmpty({ message: validationMessages.auth.user.name.isNotEmpty })
	@IsString({ message: validationMessages.auth.user.name.isString })
	@ApiProperty()
	name: string;

	@IsNotEmpty({ message: validationMessages.auth.user.lastname.isNotEmpty })
	@IsString({ message: validationMessages.auth.user.lastname.isString })
	@ApiProperty()
	lastname: string;

	@IsNotEmpty({ message: validationMessages.auth.user.email.isNotEmpty })
	@IsEmail({}, { message: validationMessages.auth.user.email.isEmail })
	@ApiProperty()
	email: string;

	@IsNotEmpty({ message: validationMessages.auth.user.password.isNotEmpty })
	@IsString({ message: validationMessages.auth.user.password.isString })
	@MinLength(6, { message: validationMessages.auth.user.password.minLength })
	@Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: validationMessages.auth.user.password.pattern,
	})
	@ApiProperty()
	password: string;

	@IsOptional()
	@IsArray({ message: validationMessages.auth.user.role.isArray })
	@IsEnum(['repartidor', 'administrador'], {
		each: true,
		message: validationMessages.auth.user.role.isEnum,
	})
	roles?: string[];

	@IsOptional()
	@IsArray({ message: validationMessages.packages.userArray.isArray })
	@ValidateNested({ each: true })
	@Type(() => String)
	packages?: string[];

	@IsOptional()
	@IsString({ message: validationMessages.auth.user.photoUrl.isString })
	@ApiProperty()
	photoUrl?: string;

	@IsOptional()
	@IsString({ message: validationMessages.auth.user.state.isEnum })
	@IsEnum({ active: 'active', inactive: 'inactive' }, { message: validationMessages.auth.user.state.isEnum })
	state?: string;

	@IsOptional()
	@IsNumber({}, { message: validationMessages.auth.user.points.isNumber })
	@IsPositive({ message: validationMessages.auth.user.points.isPositive })
	points?: number;
}
