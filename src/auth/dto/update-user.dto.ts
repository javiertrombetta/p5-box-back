import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength, IsArray } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { validationMessages } from '../../common/constants/validation-messages.constants';

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@IsOptional()
	@IsString({ message: validationMessages.auth.name.isString })
	name?: string;

	@IsOptional()
	@IsString({ message: validationMessages.auth.lastname.isString })
	lastname?: string;

	@IsOptional()
	@IsEmail({}, { message: validationMessages.auth.email.isEmail })
	email?: string;

	@IsOptional()
	@IsString({ message: validationMessages.auth.password.isString })
	@MinLength(6, { message: validationMessages.auth.password.minLength })
	@Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: validationMessages.auth.password.pattern,
	})
	password?: string;

	@IsOptional()
	@IsArray({ message: validationMessages.auth.role.isArray })
	@IsEnum(['repartidor', 'administrador'], {
		each: true,
		message: validationMessages.auth.role.isEnum,
	})
	roles?: string[];

	@IsOptional()
	@IsString({ message: validationMessages.auth.photoUrl.isString })
	photoUrl?: string;
}
