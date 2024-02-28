import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { validationMessages } from '../common/constants';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { MailService } from '../mail/mail.service';
import { PackagesService } from '../packages/packages.service';
import { LogService } from '../log/log.service';
import { ValidRoles } from './interfaces';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(User.name) private userModel: mongoose.Model<User>,
		private jwtService: JwtService,
		private mailService: MailService,
		@Inject(forwardRef(() => PackagesService)) private packagesService: PackagesService,
		private logService: LogService,
	) {}

	async register(createUserDto: CreateUserDto, performedById?: string): Promise<void> {
		const email = createUserDto.email.toLowerCase().trim();
		const existingUser = await this.userModel.findOne({ email });

		if (existingUser) {
			throw new HttpException(validationMessages.auth.user.email.inUse, HttpStatus.CONFLICT);
		}

		const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
		const user = new this.userModel({
			...createUserDto,
			email,
			password: hashedPassword,
			roles: createUserDto.roles || [ValidRoles.repartidor],
		});

		await user.save();

		const changesForLog = { ...createUserDto };
		delete changesForLog.password;

		await this.logService.create({
			action: validationMessages.log.action.user.register,
			entity: validationMessages.log.entity.user,
			entityId: user._id.toString(),
			changes: changesForLog,
			performedBy: performedById || user._id.toString(),
		});
	}

	async login(loginUserDto: LoginUserDto, performedById?: string): Promise<{ token: string }> {
		const email = loginUserDto.email.toLowerCase().trim();
		const user = await this.userModel.findOne({ email });

		if (!user) {
			throw new HttpException(validationMessages.auth.account.error.userNotFound, HttpStatus.UNAUTHORIZED);
		}

		const isPasswordMatching = await bcrypt.compare(loginUserDto.password, user.password);
		if (!isPasswordMatching) {
			throw new HttpException(validationMessages.auth.account.error.wrongCredentials, HttpStatus.UNAUTHORIZED);
		}

		const payload = { id: user._id };
		const token = this.jwtService.sign(payload);

		await this.logService.create({
			action: validationMessages.log.action.user.login,
			entity: validationMessages.log.entity.user,
			entityId: user._id.toString(),
			changes: {},
			performedBy: performedById || user._id.toString(),
		});

		return { token };
	}

	async findAll(): Promise<User[]> {
		return this.userModel.find().exec();
	}

	async findById(id: string): Promise<User | null> {
		return this.userModel.findById(id).exec();
	}

	async updateUserRole(userId: string, newRoles: string[], performedById: string): Promise<User> {
		const originalUser = await this.userModel.findById(userId);

		if (!originalUser) {
			throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
		}

		const updatedUser = await this.userModel.findByIdAndUpdate(userId, { roles: newRoles }, { new: true }).exec();

		if (!updatedUser) {
			throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
		}

		await this.logService.create({
			action: validationMessages.log.action.user.role.changeRole,
			entity: validationMessages.log.entity.user,
			entityId: updatedUser._id.toString(),
			changes: {
				oldRoles: originalUser.roles,
				newRoles: updatedUser.roles,
			},
			performedBy: performedById,
		});

		return updatedUser;
	}

	async deleteUser(userId: string, performedById: string, res: Response): Promise<void> {
		const user = await this.userModel.findById(userId).exec();
		if (!user) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

		const packages = await this.packagesService.findPackages(userId);
		if (Array.isArray(packages)) {
			for (const pkg of packages) {
				await this.packagesService.updatePackageOnDelete(pkg._id, res);
			}
		}

		await this.userModel.findByIdAndDelete(userId).exec();
		await this.logService.create({
			action: validationMessages.log.action.user.deleteUser,
			entity: validationMessages.log.entity.user,
			entityId: userId,
			changes: { deletedUser: user._id },
			performedBy: performedById,
		});
	}

	async forgotPassword(email: string, performedById?: string): Promise<void> {
		const user = await this.userModel.findOne({ email: email.toLowerCase().trim() });
		if (!user) throw new HttpException(validationMessages.auth.forgotPassword.userNotFound, HttpStatus.BAD_REQUEST);

		const resetToken = uuidv4();
		const expirationTime = new Date();
		expirationTime.setHours(expirationTime.getHours() + 1);

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpires = expirationTime;

		await user.save();

		const resetUrl = `${process.env.FRONTEND_URL_DEV}/reset-password?token=${resetToken}`;

		const mailContent = validationMessages.mails.resetPasswordEmail.body.replace('{{resetUrl}}', resetUrl);

		await this.mailService.sendMail(user.email, validationMessages.mails.resetPasswordEmail.subject, mailContent);

		await this.logService.create({
			action: validationMessages.log.action.user.forgotPassword,
			entity: validationMessages.log.entity.user,
			entityId: user._id.toString(),
			changes: { resetPasswordToken: user.resetPasswordToken },
			performedBy: performedById || user._id.toString(),
		});
	}

	async verifyResetPasswordToken(token: string): Promise<boolean> {
		const user = await this.userModel
			.findOne({
				resetPasswordToken: token,
				resetPasswordExpires: { $gt: Date.now() },
			})
			.exec();

		if (!user) throw new HttpException(validationMessages.auth.resetPassword.tokenInvalidOrExpired, HttpStatus.BAD_REQUEST);

		return true;
	}

	async resetPassword(token: string, newPassword: string, performedById?: string): Promise<void> {
		const user = await this.userModel.findOne({
			resetPasswordToken: token,
			resetPasswordExpires: { $gt: Date.now() },
		});

		if (!user) {
			throw new HttpException(validationMessages.auth.resetPassword.tokenInvalidOrExpired, HttpStatus.BAD_REQUEST);
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();

		const mailContent = validationMessages.mails.passwordChanged.body;
		await this.mailService.sendMail(user.email, validationMessages.mails.passwordChanged.subject, mailContent);

		await this.logService.create({
			action: validationMessages.log.action.user.resetPassword,
			entity: validationMessages.log.entity.user,
			entityId: user._id.toString(),
			changes: { password: validationMessages.auth.user.password.reset },
			performedBy: performedById || user._id.toString(),
		});
	}

	async updateUserPackages(userId: string, packageId: string, performedById: string): Promise<void> {
		const user = await this.findById(userId);
		if (!user) {
			throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
		}

		if (!Array.isArray(user.packages)) {
			user.packages = [];
		}

		user.packages.push(packageId);
		await user.save();

		await this.logService.create({
			action: validationMessages.log.action.user.array.addUserPackage,
			entity: validationMessages.log.entity.user,
			entityId: user._id.toString(),
			changes: { addedPackage: packageId },
			performedBy: performedById,
		});
	}

	async reorderUserPackages(userId: string, packageIdToReorder: string, performedById: string): Promise<void> {
		const user = await this.findById(userId);
		if (!user || !user.packages) {
			throw new HttpException(validationMessages.packages.userArray.userNotFound, HttpStatus.NOT_FOUND);
		}
		const filteredPackages = user.packages.filter(packageId => packageId !== packageIdToReorder);
		const reorderedPackages = [packageIdToReorder, ...filteredPackages];

		user.packages = reorderedPackages;
		await user.save();

		await this.logService.create({
			action: validationMessages.log.action.user.array.changeOrder,
			entity: validationMessages.log.entity.user,
			entityId: user._id.toString(),
			changes: { reorderedPackages: reorderedPackages },
			performedBy: performedById,
		});
	}

	async removePackageFromUser(userId: string, packageId: string): Promise<void> {
		const user = await this.userModel.findById(userId).exec();
		if (!user) {
			throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
		}

		const updatedPackages = user.packages.filter(pkgId => pkgId !== packageId);
		user.packages = updatedPackages;
		await user.save();

		await this.logService.create({
			action: validationMessages.log.action.user.array.clear,
			entity: validationMessages.log.entity.user,
			entityId: user._id.toString(),
			changes: { removedPackage: packageId },
			performedBy: userId,
		});
	}

	async removePackageFromAllUsers(uuidPackage: string): Promise<void> {
		await this.userModel.updateMany({ packages: uuidPackage }, { $pull: { packages: uuidPackage } }).exec();
	}

	async loadUserPackage(userId: string, packageId: string): Promise<void> {
		const user = await this.userModel.findById(userId).exec();
		if (!user) {
			throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
		}

		user.packages = [...user.packages, packageId];
		await user.save();

		await this.logService.create({
			action: validationMessages.log.action.user.array.loadPackages,
			entity: validationMessages.log.entity.user,
			entityId: user._id.toString(),
			changes: { package: packageId },
			performedBy: userId,
		});
	}

	async changeState(userId: string, newState: any): Promise<void> {
		const user = await this.userModel.findById(userId);
		if (!user) {
			throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
		}

		user.state = newState;
		await user.save();

		await this.logService.create({
			action: validationMessages.log.action.user.state.changeState,
			entity: validationMessages.log.entity.user,
			entityId: user._id.toString(),
			changes: { state: newState },
			performedBy: userId,
		});
	}

	async finishPackage(uuidPackage: string, userId: string): Promise<void> {
		await this.packagesService.finishPackage(uuidPackage, userId);
		await this.removePackageFromUser(userId, uuidPackage);
	}
}
