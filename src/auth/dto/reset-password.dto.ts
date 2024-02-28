import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { validationMessages } from '../../common/constants';

export class ResetPasswordDto {
	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	token: string;

	@IsNotEmpty({ message: validationMessages.auth.user.password.isNotEmpty })
	@IsString({ message: validationMessages.auth.user.password.isString })
	@MinLength(6, { message: validationMessages.auth.user.password.minLength })
	@Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: validationMessages.auth.user.password.pattern,
	})
	@ApiProperty()
	newPassword: string;
}
