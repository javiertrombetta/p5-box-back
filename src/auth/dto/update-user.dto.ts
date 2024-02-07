import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { validationMessages } from '../../common/constants/validation-messages.constants';

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@IsOptional()
	@IsString({ message: validationMessages.user.name.isString })
	name?: string;

	@IsOptional()
	@IsString({ message: validationMessages.user.lastname.isString })
	lastname?: string;

	@IsOptional()
	@IsEmail({}, { message: validationMessages.user.email.isEmail })
	email?: string;

	@IsOptional()
	@IsString({ message: validationMessages.user.password.isString })
	@MinLength(6, { message: validationMessages.user.password.minLength })
	@Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: validationMessages.user.password.pattern,
	})
	password?: string;

	@IsOptional()
	@IsString({ message: validationMessages.user.role.isString })
	@IsEnum(['repartidor', 'administrador'], { message: validationMessages.user.role.isEnum })
	role?: string;
}
