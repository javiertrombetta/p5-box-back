import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength, IsArray } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { validationMessages } from '../../common/constants/validation-messages.constants';

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@IsOptional()
	@IsString({ message: validationMessages.auth.user.name.isString })
	name?: string;

	@IsOptional()
	@IsString({ message: validationMessages.auth.user.lastname.isString })
	lastname?: string;

	@IsOptional()
	@IsEmail({}, { message: validationMessages.auth.user.email.isEmail })
	email?: string;

	@IsOptional()
	@IsString({ message: validationMessages.auth.user.password.isString })
	@MinLength(6, { message: validationMessages.auth.user.password.minLength })
	@Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: validationMessages.auth.user.password.pattern,
	})
	password?: string;

	@IsOptional()
	@IsArray({ message: validationMessages.auth.user.role.isArray })
	@IsEnum(['repartidor', 'administrador'], {
		each: true,
		message: validationMessages.auth.user.role.isEnum,
	})
	roles?: string[];

	@IsOptional()
	@IsString({ message: validationMessages.auth.user.photoUrl.isString })
	photoUrl?: string;
}
