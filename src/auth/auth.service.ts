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

		if (existingUser) throw new HttpException(validationMessages.auth.user.email.inUse, HttpStatus.CONFLICT);

		const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
		const user = new this.userModel({
			...createUserDto,
			email,
			password: hashedPassword,
			roles: [ValidRoles.repartidor],
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

		if (user.state !== validationMessages.auth.user.state.isActiveState) {
			throw new HttpException(validationMessages.auth.account.error.inactiveAccount, HttpStatus.UNAUTHORIZED);
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

	async findUsersByState(state: string): Promise<User[]> {
		const queryState =
			state === validationMessages.auth.user.state.isActiveState ? validationMessages.auth.user.state.isActiveState : validationMessages.auth.user.state.isInactiveSate;
		return this.userModel.find({ state: queryState }).exec();
	}

	async isPackageAssignedToUser(userId: string, packageId: string): Promise<boolean> {
		const user = await this.userModel.findById(userId).exec();
		if (!user) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

		return user.packages.includes(packageId);
	}

	async updateUserRole(userId: string, newRoles: string[], performedById: string, res: Response): Promise<User> {
		const originalUser = await this.userModel.findById(userId);

		if (!originalUser) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

		if (userId === performedById && originalUser.roles.includes(ValidRoles.administrador) && !newRoles.includes(ValidRoles.administrador)) {
			throw new HttpException(validationMessages.auth.user.role.connotRemoveSelfRole, HttpStatus.FORBIDDEN);
		}

		const updatedUser = await this.userModel.findByIdAndUpdate(userId, { roles: newRoles }, { new: true }).exec();

		if (!updatedUser) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

		if (newRoles.includes(ValidRoles.administrador)) {
			await this.clearUserPackagesAndResetPackages(userId, res);
		}

		let action: string;
		if (newRoles.includes(ValidRoles.repartidor) && newRoles.includes(ValidRoles.administrador)) action = validationMessages.log.action.user.role.addedBothRoles;
		else if (newRoles.includes(ValidRoles.repartidor)) action = validationMessages.log.action.user.role.addedRepartidorRole;
		else if (newRoles.includes(ValidRoles.administrador)) action = validationMessages.log.action.user.role.addedAdministradorRole;

		await this.logService.create({
			action: action,
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

	async clearUserPackagesAndResetPackages(userId: string, res: Response): Promise<void> {
		const user = await this.userModel.findById(userId);
		if (!user || !user.packages.length) return;

		for (const packageId of user.packages) {
			await this.packagesService.updatePackageOnCancel(packageId, userId, res);
		}

		user.packages = [];
		await user.save();
	}

	async deleteUser(userId: string, performedById: string, res: Response): Promise<void> {
		const user = await this.userModel.findById(userId).exec();
		if (!user) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

		const packages = await this.packagesService.findPackages(userId);
		if (Array.isArray(packages)) {
			for (const pkg of packages) await this.packagesService.updatePackageOnDelete(pkg._id, res);
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

		if (!user) throw new HttpException(validationMessages.auth.resetPassword.tokenInvalidOrExpired, HttpStatus.BAD_REQUEST);

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
		if (!user) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

		if (!Array.isArray(user.packages)) user.packages = [];

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
		if (!user || !user.packages) throw new HttpException(validationMessages.packages.userArray.userNotFound, HttpStatus.NOT_FOUND);

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
		if (!user) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

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
		if (!user) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

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

	async changeState(userId: string, performedById: string): Promise<string> {
		if (userId === performedById) {
			throw new HttpException(validationMessages.auth.user.state.cannotChangeOwnState, HttpStatus.FORBIDDEN);
		}

		const user = await this.userModel.findById(userId);
		if (!user) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

		const newState =
			user.state === validationMessages.auth.user.state.isActiveState ? validationMessages.auth.user.state.isInactiveSate : validationMessages.auth.user.state.isActiveState;
		user.state = newState;
		await user.save();

		const action =
			newState === validationMessages.auth.user.state.isActiveState ? validationMessages.log.action.user.state.activate : validationMessages.log.action.user.state.deactivate;

		await this.logService.create({
			action: action,
			entity: validationMessages.log.entity.user,
			entityId: user._id.toString(),
			changes: { state: newState },
			performedBy: performedById,
		});

		return newState;
	}

	async finishPackage(uuidPackage: string, userId: string): Promise<void> {
		await this.packagesService.finishPackage(uuidPackage, userId);
		await this.removePackageFromUser(userId, uuidPackage);
	}

	async findAllUsersWithPackages(): Promise<User[]> {
		return this.userModel.find({ 'packages.0': { $exists: true } }).exec();
	}

	async clearUserPackages(userId: string): Promise<void> {
		const user = await this.userModel.findById(userId);
		if (!user) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

		const previousPackages = [...user.packages];

		user.packages = [];
		await user.save();

		await this.logService.create({
			action: validationMessages.log.action.user.array.clear,
			entity: validationMessages.log.entity.user,
			entityId: userId,
			changes: { previousPackages },
			performedBy: 'CRON',
		});
	}

	async countUsers(): Promise<number> {
		return this.userModel.countDocuments().exec();
	}
}
