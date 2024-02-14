import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { validationMessages } from '../common/constants';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(User.name)
		private userModel: Model<User>,
		private jwtService: JwtService,
	) {}

	async register(createUserDto: CreateUserDto): Promise<void> {
		const email = createUserDto.email.toLowerCase().trim();
		const existingUser = await this.userModel.findOne({ email });

		if (existingUser) {
			throw new HttpException(validationMessages.auth.email.inUse, HttpStatus.BAD_REQUEST);
		}

		const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
		const user = new this.userModel({
			...createUserDto,
			email,
			password: hashedPassword,
			roles: createUserDto.roles || ['repartidor'],
		});

		await user.save();
	}

	async login(loginUserDto: LoginUserDto): Promise<{ token: string }> {
		const email = loginUserDto.email.toLowerCase().trim();
		const user = await this.userModel.findOne({ email });

		if (!user) {
			throw new HttpException(validationMessages.auth.account.userNotFound, HttpStatus.UNAUTHORIZED);
		}

		const isPasswordMatching = await bcrypt.compare(loginUserDto.password, user.password);
		if (!isPasswordMatching) {
			throw new HttpException(validationMessages.auth.account.wrongCredentials, HttpStatus.UNAUTHORIZED);
		}

		const payload = { id: user._id };
		const token = this.jwtService.sign(payload);

		return { token };
	}

	async findAll(): Promise<User[]> {
		return this.userModel.find().exec();
	}

	async findById(id: string): Promise<User | null> {
		return this.userModel.findById(id).exec();
	}

	async updateUserRole(userId: string, newRoles: string[]): Promise<User> {
		const updatedUser = await this.userModel.findByIdAndUpdate(userId, { roles: newRoles }, { new: true }).exec();
		if (!updatedUser) {
			throw new HttpException(validationMessages.auth.account.notFound, HttpStatus.NOT_FOUND);
		}
		return updatedUser;
	}

	async deleteUser(userId: string): Promise<void> {
		const result = await this.userModel.findByIdAndDelete(userId).exec();
		if (!result) {
			throw new HttpException(validationMessages.auth.account.notFound, HttpStatus.NOT_FOUND);
		}
	}
}
