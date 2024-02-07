import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(User.name) private userModel: Model<User>,
		private jwtService: JwtService,
	) {}

	async register(createUserDto: CreateUserDto) {
		const { email, password } = createUserDto;
		const existingUser = await this.userModel.findOne({ email });

		if (existingUser) {
			throw new HttpException('El correo ya está en uso.', HttpStatus.BAD_REQUEST);
		}

		const hashedPassword = await bcrypt.hash(password, 12);
		const newUser = new this.userModel({
			...createUserDto,
			password: hashedPassword,
		});

		try {
			await newUser.save();
			return {
				fullName: newUser.fullName,
				email: newUser.email,
				message: 'Usuario registrado con éxito.',
			};
		} catch (error) {
			throw new HttpException('Error al registrar al usuario', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async login(loginUserDto: LoginUserDto): Promise<{ fullName: string; email: string; cookie: string }> {
		const { email, password } = loginUserDto;
		const user = await this.userModel.findOne({ email }).exec();

		if (!user) {
			throw new HttpException('Usuario no encontrado.', HttpStatus.UNAUTHORIZED);
		}

		const isPasswordMatching = await bcrypt.compare(password, user.password);
		if (!isPasswordMatching) {
			throw new HttpException('Credenciales incorrectas.', HttpStatus.UNAUTHORIZED);
		}

		const payload = { email: user.email, sub: user._id.toString() };
		const token = this.jwtService.sign(payload);
		const cookie = `Authentication=${token}; HttpOnly; Path=/; Max-Age=${60 * 60}`;

		return {
			fullName: user.fullName,
			email: user.email,
			cookie,
		};
	}

	async findById(id: string): Promise<User | null> {
		return this.userModel.findById(id).exec();
	}
}
