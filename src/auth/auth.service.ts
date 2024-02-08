import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { validationMessages } from '../common/constants/validation-messages.constants';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(User.name) private userModel: Model<User>,
		private jwtService: JwtService,
	) {}

	async register(createUserDto: CreateUserDto) {
		const { email } = createUserDto;
		const existingUser = await this.userModel.findOne({ email });

		if (existingUser) {
			throw new HttpException(validationMessages.user.error.emailInUse, HttpStatus.BAD_REQUEST);
		}

		const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
		await new this.userModel({
			...createUserDto,
			password: hashedPassword,
		}).save();
	}

	async login(loginUserDto: LoginUserDto): Promise<{ user: any; token: string }> {
		const { email, password } = loginUserDto;
		const user = await this.userModel.findOne({ email }).exec();

		if (!user) {
			throw new HttpException(validationMessages.user.error.userNotFound, HttpStatus.UNAUTHORIZED);
		}

		const isPasswordMatching = await bcrypt.compare(password, user.password);
		if (!isPasswordMatching) {
			throw new HttpException(validationMessages.user.error.incorrectCredentials, HttpStatus.UNAUTHORIZED);
		}

		const payload = { email: user.email, sub: user._id.toString(), role: user.role };
		const token = this.jwtService.sign(payload);

		const userObject = user.toObject();
		delete userObject.password;

		return { user: userObject, token };
	}

	async findAll(): Promise<User[]> {
		return this.userModel.find().exec();
	}

	async updateUserRole(userId: string, newRole: string): Promise<User> {
		const updatedUser = await this.userModel.findByIdAndUpdate(userId, { role: newRole }, { new: true }).exec();

		if (!updatedUser) {
			throw new HttpException(validationMessages.user.error.userNotFound, HttpStatus.NOT_FOUND);
		}

		return updatedUser;
	}

	async deleteUser(userId: string): Promise<void> {
		const deletedUser = await this.userModel.findByIdAndDelete(userId).exec();

		if (!deletedUser) {
			throw new HttpException(validationMessages.user.error.userNotFound, HttpStatus.NOT_FOUND);
		}
	}

	async findById(id: string): Promise<User | null> {
		return this.userModel.findById(id).exec();
	}
}
