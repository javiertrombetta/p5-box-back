import { PartialType } from '@nestjs/mapped-types';
import { ArrayContains, IsArray, IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { validationMessages } from '../../common/constants/validation-messages.constants';
import { ValidRoles } from '../interfaces';

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@IsOptional()
	@IsString({ message: validationMessages.auth.user.name.isString })
	@ApiProperty({ description: validationMessages.swagger.user.name, required: false })
	name?: string;

	@IsOptional()
	@IsString({ message: validationMessages.auth.user.lastname.isString })
	@ApiProperty({ description: validationMessages.swagger.user.lastname, required: false })
	lastname?: string;

	@IsOptional()
	@IsEmail({}, { message: validationMessages.auth.user.email.isEmail })
	@ApiProperty({ description: validationMessages.swagger.user.email, required: false })
	email?: string;

	@IsOptional()
	@IsString({ message: validationMessages.auth.user.password.isString })
	@MinLength(6, { message: validationMessages.auth.user.password.minLength })
	@Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: validationMessages.auth.user.password.pattern,
	})
	@ApiProperty({ description: validationMessages.swagger.user.password, required: false })
	password?: string;

	@IsOptional()
	@IsString({ message: validationMessages.auth.user.photoUrl.isString })
	@ApiProperty({ description: validationMessages.swagger.user.photoUrl, required: false })
	photoUrl?: string;

	@IsOptional()
	@IsArray({ message: validationMessages.auth.user.role.isArray })
	@ArrayContains([ValidRoles.repartidor, ValidRoles.administrador], { message: validationMessages.auth.user.role.isEnum })
	@ApiProperty({ description: validationMessages.swagger.user.roles, required: false, type: [String] })
	roles?: string[];
}
