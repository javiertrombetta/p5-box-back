import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	token: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	newPassword: string;
}
