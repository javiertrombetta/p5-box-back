import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	contrasena: string;
}
