import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { validationMessages } from '../../common/constants/validation-messages.constants';

export class LoginUserDto {
	@IsNotEmpty({ message: validationMessages.user.email.isNotEmpty })
	@IsEmail({}, { message: validationMessages.user.email.isEmail })
	email: string;

	@IsNotEmpty({ message: validationMessages.user.password.isNotEmpty })
	@IsString({ message: validationMessages.user.password.isString })
	password: string;
}
