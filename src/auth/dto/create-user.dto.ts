import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { validationMessages } from '../../common/constants/validation-messages.constants';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
	@IsNotEmpty({ message: validationMessages.auth.user.name.isNotEmpty })
	@IsString({ message: validationMessages.auth.user.name.isString })
	@ApiProperty({ description: validationMessages.swagger.user.name, required: true })
	name: string;

	@IsNotEmpty({ message: validationMessages.auth.user.lastname.isNotEmpty })
	@IsString({ message: validationMessages.auth.user.lastname.isString })
	@ApiProperty({ description: validationMessages.swagger.user.lastname, required: true })
	lastname: string;

	@IsNotEmpty({ message: validationMessages.auth.user.email.isNotEmpty })
	@IsEmail({}, { message: validationMessages.auth.user.email.isEmail })
	@ApiProperty({ description: validationMessages.swagger.user.email, required: true })
	email: string;

	@IsNotEmpty({ message: validationMessages.auth.user.password.isNotEmpty })
	@IsString({ message: validationMessages.auth.user.password.isString })
	@MinLength(6, { message: validationMessages.auth.user.password.minLength })
	@Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: validationMessages.auth.user.password.pattern,
	})
	@ApiProperty({ description: validationMessages.swagger.user.password, required: true })
	password: string;

	@IsOptional()
	@IsString({ message: validationMessages.auth.user.photoUrl.isString })
	@ApiProperty({ description: validationMessages.swagger.user.photoUrl, required: false })
	photoUrl?: string;
}
