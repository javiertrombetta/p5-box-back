import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { validationMessages } from '../../common/constants';

export class ResetPasswordDto {
	@IsNotEmpty({ message: validationMessages.auth.token.isNotEmpty })
	@IsString({ message: validationMessages.auth.token.isString })
	@ApiProperty({ description: validationMessages.swagger.user.token, required: true })
	token: string;

	@IsNotEmpty({ message: validationMessages.auth.user.password.isNotEmpty })
	@IsString({ message: validationMessages.auth.user.password.isString })
	@MinLength(6, { message: validationMessages.auth.user.password.minLength })
	@Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: validationMessages.auth.user.password.pattern,
	})
	@ApiProperty({ description: validationMessages.swagger.user.newPassword, required: true })
	newPassword: string;
}
