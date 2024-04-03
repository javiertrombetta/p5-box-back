import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities';

import { MailService } from '../mail/mail.service';
import { PackagesService } from '../packages/packages.service';
import { LogService } from '../log/log.service';
import { PhotosService } from '../photos/photos.service';

import { validationMessages } from '../common/constants';
import { ValidRoles } from './interfaces';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(User.name) private userModel: mongoose.Model<User>,
		private jwtService: JwtService,
		private mailService: MailService,
		@Inject(forwardRef(() => PackagesService)) private packagesService: PackagesService,
		private logService: LogService,
		@Inject(forwardRef(() => PhotosService)) private photosService: PhotosService,
	) {}

	async oAuthLogin(user: any): Promise<{ token: string; redirectWithError?: string }> {
		if (!user) {
			throw new HttpException(validationMessages.auth.account.error.googleAccountNotFound, HttpStatus.UNAUTHORIZED);
		}

		let existingUser = await this.userModel.findOne({ email: user.email });

		if (existingUser && !existingUser.provider) {
			return { token: null, redirectWithError: 'Ya existe una cuenta local registrada con este email.' };
		}

		if (!existingUser) {
			const randomPassword = crypto.randomBytes(16).toString('hex');
			const hashedPassword = await bcrypt.hash(randomPassword, 10);

			existingUser = new this.userModel({
				name: user.name,
				lastname: user.lastname,
				email: user.email,
				password: hashedPassword,
				provider: user.provider,
				providerId: user.providerId,
				photoUrl: user.picture,
				roles: [ValidRoles.repartidor],
			});
			await existingUser.save();

			await this.logService.create({
				action: validationMessages.log.action.user.oauth,
				entity: validationMessages.log.entity.user,
				entityId: existingUser._id.toString(),
				changes: {
					name: user.name,
					email: user.email,
					provider: user.provider,
				},
				performedBy: existingUser._id.toString(),
			});
		}

		const payload = { id: existingUser._id };
		const token = this.jwtService.sign(payload);

		await this.logService.create({
			action: validationMessages.log.action.user.login,
			entity: validationMessages.log.entity.user,
			entityId: existingUser._id.toString(),
			changes: {},
			performedBy: existingUser._id.toString(),
		});

		return { token };
	}

	async register(createUserDto: CreateUserDto, photoFile?: Express.Multer.File, performedById?: string): Promise<void> {
		const email = createUserDto.email.toLowerCase().trim();
		const existingUser = await this.userModel.findOne({ email });

		if (existingUser) throw new HttpException(validationMessages.auth.user.email.inUse, HttpStatus.CONFLICT);

		const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

		let photoUrl = '';

		if (photoFile) {
			photoUrl = await this.photosService.uploadFileToS3(photoFile);
		}

		const user = new this.userModel({
			...createUserDto,
			email,
			password: hashedPassword,
			roles: [ValidRoles.repartidor],
			photoUrl,
		});

		await user.save();

		const changesForLog = { ...createUserDto };
		delete changesForLog.password;
		delete changesForLog.photoUrl;

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

		if (new Date() < user.blockUntil) {
			const blockDate = user.blockUntil;
			const formattedDate = `${blockDate.getDate()}/${blockDate.getMonth() + 1}/${blockDate.getFullYear()}`;
			const formattedTime = blockDate.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
			const errorMessage = `${validationMessages.auth.user.blockUntil.loginInfo} ${formattedDate} a las ${formattedTime} hs.`;
			throw new HttpException(errorMessage, HttpStatus.FORBIDDEN);
		} else {
			user.blockUntil = null;
		}

		if (user.points < -100 && user.state === validationMessages.auth.user.state.isActiveState) {
			throw new HttpException(validationMessages.auth.user.state.isInactiveByScore, HttpStatus.UNAUTHORIZED);
		}

		if (user.state === validationMessages.auth.user.state.isInactiveSate) {
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

	async logout(res: Response, negativeDeclaration: boolean = false): Promise<void> {
		try {
			res.clearCookie('Authentication', {
				httpOnly: true,
				path: '/',
			});

			if (negativeDeclaration) {
				res.status(HttpStatus.OK).json({ message: validationMessages.legals.negativeInfo });
			} else {
				res.status(HttpStatus.OK).json({ message: validationMessages.auth.account.success.logout });
			}
		} catch (error) {
			throw new HttpException(validationMessages.serverError.unexpected, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async forgotPassword(email: string, performedById?: string): Promise<void> {
		const user = await this.userModel.findOne({ email: email.toLowerCase().trim() });
		if (!user) throw new HttpException(validationMessages.auth.forgotPassword.userNotFound, HttpStatus.BAD_REQUEST);

		let resetToken: string;
		let isUnique = false;
		while (!isUnique) {
			resetToken = Math.floor(10000 + Math.random() * 90000).toString();
			const existingUser = await this.userModel.findOne({ resetPasswordToken: resetToken });
			if (!existingUser) {
				isUnique = true;
			}
		}

		const expirationTime = new Date();
		expirationTime.setMinutes(expirationTime.getMinutes() + 5);

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpires = expirationTime;

		await user.save();

		const mailContent = validationMessages.mails.resetCodeEmail.body.replace('{{resetCode}}', resetToken);

		this.mailService.sendMail(user.email, validationMessages.mails.resetCodeEmail.subject, mailContent);

		await this.logService.create({
			action: validationMessages.log.action.user.forgotPassword,
			entity: validationMessages.log.entity.user,
			entityId: user._id.toString(),
			changes: { resetPasswordToken: user.resetPasswordToken },
			performedBy: performedById || user._id.toString(),
		});
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
		this.mailService.sendMail(user.email, validationMessages.mails.passwordChanged.subject, mailContent);

		await this.logService.create({
			action: validationMessages.log.action.user.resetPassword,
			entity: validationMessages.log.entity.user,
			entityId: user._id.toString(),
			changes: { password: validationMessages.auth.user.password.reset },
			performedBy: performedById || user._id.toString(),
		});
	}

	async countDeilverymanRegisteredBeforeDate(date: Date): Promise<number> {
		return this.userModel
			.countDocuments({
				createdAt: { $lte: date },
				roles: ValidRoles.repartidor,
			})
			.exec();
	}

	async findAll(): Promise<User[]> {
		return this.userModel.find().exec();
	}

	async findById(id: string): Promise<User | null> {
		return this.userModel.findById(id).exec();
	}

	async findUserByEmail(email: string): Promise<User | null> {
		return this.userModel.findOne({ email }).exec();
	}

	async findUsersByState(state: string): Promise<User[]> {
		const queryState =
			state === validationMessages.auth.user.state.isActiveState ? validationMessages.auth.user.state.isActiveState : validationMessages.auth.user.state.isInactiveSate;
		return this.userModel.find({ state: queryState }).exec();
	}

	async findAllUsersWithPackages(): Promise<User[]> {
		return this.userModel.find({ 'packages.0': { $exists: true } }).exec();
	}

	async findUsersBeforeDate(date: Date, role: string): Promise<User[]> {
		return this.userModel
			.find({
				createdAt: { $lte: date },
				roles: role,
			})
			.exec();
	}

	async updateUserPhotoUrl(userId: string, photoUrl: string): Promise<void> {
		const user = await this.userModel.findById(userId);
		if (!user) {
			throw new HttpException(validationMessages.auth.account.error.userNotFound, HttpStatus.UNAUTHORIZED);
		}
		user.photoUrl = photoUrl;
		await user.save();
	}

	async isPackageAssignedToUser(userId: string, packageId: string): Promise<boolean> {
		const user = await this.userModel.findById(userId).exec();
		if (!user) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

		return user.packages.includes(packageId);
	}

	async updateUserRole(userId: string, newRoles: string[], performedById: string): Promise<User> {
		const originalUser = await this.userModel.findById(userId);

		if (!originalUser) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

		if (userId === performedById && originalUser.roles.includes(ValidRoles.administrador) && !newRoles.includes(ValidRoles.administrador)) {
			throw new HttpException(validationMessages.auth.user.role.connotRemoveSelfRole, HttpStatus.FORBIDDEN);
		}

		const updatedUser = await this.userModel.findByIdAndUpdate(userId, { roles: newRoles }, { new: true }).exec();

		if (!updatedUser) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

		if (newRoles.includes(ValidRoles.administrador)) {
			await this.clearUserPackagesAndResetPackages(userId);
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

	async updatePackages(userId: string, packages: string[] | string, performedById?: string): Promise<void> {
		const user = await this.userModel.findById(userId);
		if (!user) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

		let actionLog = '';
		if (Array.isArray(packages)) {
			user.packages = packages;
			actionLog = validationMessages.log.action.user.array.updateFullArray;
		} else {
			user.packages.push(packages);
			actionLog = validationMessages.log.action.user.array.updateOnePackage;
		}

		await user.save();

		await this.logService.create({
			action: actionLog,
			entity: validationMessages.log.entity.user,
			entityId: userId,
			changes: Array.isArray(packages) ? { newOrder: packages } : { package: packages },
			performedBy: performedById || userId,
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

	async setBlockTimeDuration(userId: string, duration: string, reason: string): Promise<void> {
		const user = await this.userModel.findById(userId);
		if (!user) {
			throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
		}

		const blockUntil = new Date();
		blockUntil.setHours(blockUntil.getHours() + parseInt(duration.replace('h', ''), 10));
		user.blockUntil = blockUntil;

		await user.save();

		const formattedBlockUntil = `${blockUntil.getDate()}/${blockUntil.getMonth() + 1}/${blockUntil.getFullYear()} a las ${blockUntil.getHours()}:${blockUntil.getMinutes().toString().padStart(2, '0')}`;
		const body = validationMessages.mails.blockedByLegalDeclaration.body.replace('{{reason}}', reason).replace('{{blockUntil}}', formattedBlockUntil);

		this.mailService.sendMail(user.email, validationMessages.mails.blockedByLegalDeclaration.subject, body);

		await this.logService.create({
			action: validationMessages.log.action.user.state.deactivate,
			entity: validationMessages.log.entity.user,
			entityId: userId,
			changes: { state: user.state, reason },
			performedBy: 'SYSTEM',
		});
	}

	async adjustPoints(userId: string, points: number): Promise<void> {
		const user = await this.userModel.findById(userId);
		if (!user) {
			throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
		}

		user.points += points;
		if (user.points <= -100) {
			user.state = validationMessages.auth.user.state.isInactiveSate;
			await this.logService.create({
				action: validationMessages.log.action.user.state.deactivateByPoints,
				entity: validationMessages.log.entity.user,
				entityId: user._id.toString(),
				changes: {
					previousState: user.state,
					newState: validationMessages.auth.user.state.isInactiveSate,
				},
				performedBy: user._id.toString(),
			});
		}
		await user.save();
	}

	async addPointsForConsecutiveDeliveries(userId: string, pointsForDelivery: number): Promise<void> {
		const user = await this.userModel.findById(userId);
		if (!user) {
			throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
		}
		user.consecutiveDeliveries = (user.consecutiveDeliveries || 0) + 1;
		let pointsToAdd = pointsForDelivery;
		if (user.consecutiveDeliveries >= 10) {
			pointsToAdd += 50;
			user.consecutiveDeliveries = 0;

			await this.logService.create({
				action: validationMessages.log.action.user.points.sumForBonus,
				entity: validationMessages.log.entity.user,
				entityId: userId,
				changes: {
					consecutiveDeliveries: 10,
					pointsAdded: 50,
				},
				performedBy: userId,
			});
		}
		user.points += pointsToAdd;
		await user.save();
	}

	async resetConsecutiveDeliveries(userId: string): Promise<void> {
		const user = await this.userModel.findById(userId);
		if (!user) {
			throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
		}
		user.consecutiveDeliveries = 0;
		await user.save();
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

	async clearUserPackagesAndResetPackages(userId: string): Promise<void> {
		const user = await this.userModel.findById(userId);
		if (!user || !user.packages.length) return;

		for (const packageId of user.packages) {
			await this.packagesService.updatePackageOnCancel(packageId, userId);
		}

		user.packages = [];
		await user.save();
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

	async deleteUser(userId: string, performedById: string): Promise<void> {
		const user = await this.userModel.findById(userId).exec();
		if (!user) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);

		const packages = await this.packagesService.findPackagesByDeliveryMan(userId);
		if (Array.isArray(packages)) {
			for (const pkg of packages) await this.packagesService.updatePackageOnDelete(pkg._id);
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
}
