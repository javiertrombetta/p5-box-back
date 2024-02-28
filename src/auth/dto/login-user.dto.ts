import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { validationMessages } from '../../common/constants/validation-messages.constants';

export class LoginUserDto {
	@IsNotEmpty({ message: validationMessages.auth.user.email.isNotEmpty })
	@IsEmail({}, { message: validationMessages.auth.user.email.isEmail })
	email: string;

	@IsNotEmpty({ message: validationMessages.auth.user.password.isNotEmpty })
	@IsString({ message: validationMessages.auth.user.password.isString })
	password: string;
}
