import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { validationMessages } from '../../common/constants/validation-messages.constants';

export class ForgotPasswordDto {
	@IsNotEmpty({ message: validationMessages.auth.user.email.isNotEmpty })
	@IsEmail({}, { message: validationMessages.auth.user.email.isEmail })
	@ApiProperty({ description: validationMessages.swagger.user.email, required: true })
	email: string;
}
