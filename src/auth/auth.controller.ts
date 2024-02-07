import { Body, Controller, Post, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	async register(@Body() createUserDto: CreateUserDto, @Res() response: Response) {
		await this.authService.register(createUserDto);
		response.status(HttpStatus.CREATED).json({
			message: 'Usuario registrado con éxito.',
		});
	}

	@Post('login')
	async login(@Body() loginUserDto: LoginUserDto, @Res() response: Response) {
		const { cookie } = await this.authService.login(loginUserDto);
		response.setHeader('Set-Cookie', cookie);
		response.status(HttpStatus.OK).json({
			message: 'Usuario logueado con éxito.',
		});
	}
}
