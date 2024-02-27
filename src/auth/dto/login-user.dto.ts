import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { validationMessages } from '../../common/constants/validation-messages.constants';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
	@IsNotEmpty({ message: validationMessages.auth.email.isNotEmpty })
	@IsEmail({}, { message: validationMessages.auth.email.isEmail })
	@ApiProperty()
	email: string;

	@IsNotEmpty({ message: validationMessages.auth.password.isNotEmpty })
	@IsString({ message: validationMessages.auth.password.isString })
	@ApiProperty()
	password: string;
}
