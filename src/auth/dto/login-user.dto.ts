import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { validationMessages } from '../../common/constants/validation-messages.constants';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
	@IsNotEmpty({ message: validationMessages.auth.user.email.isNotEmpty })
	@IsEmail({}, { message: validationMessages.auth.user.email.isEmail })
	@ApiProperty({ description: validationMessages.swagger.user.email, required: true })
	email: string;

	@IsNotEmpty({ message: validationMessages.auth.user.password.isNotEmpty })
	@IsString({ message: validationMessages.auth.user.password.isString })
	@ApiProperty({ description: validationMessages.swagger.user.password, required: true })
	password: string;
}
