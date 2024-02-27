import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	email: string;
}
