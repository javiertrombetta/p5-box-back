import { Inject, Injectable, NotAcceptableException, NotFoundException, forwardRef } from '@nestjs/common';
import { Response } from 'express';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Package } from './entities/package.entity';
import { validationMessages } from '../common/constants';
import { CreatePackageDto, UpdatePackageDto } from './dto';
import { AuthService } from '../auth/auth.service';
import { ExceptionHandlerService } from '../common/helpers';
import { LogService } from '../log/log.service';

@Injectable()
export class PackagesService {
	constructor(
		@InjectModel(Package.name) private packageModel: mongoose.Model<Package>,
		@Inject(forwardRef(() => AuthService)) private authService: AuthService,
		private logService: LogService,
	) {}

	async findById(id: string): Promise<Package> {
		const paquete = await this.packageModel.findById(id);
		if (!paquete) {
			throw new NotAcceptableException(validationMessages.packages.error.packageNotFound);
		}
		return paquete;
	}

	async findAvailablePackage(): Promise<Package[]> {
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date();
		endOfDay.setHours(23, 59, 59, 999);

		return this.packageModel
			.find({
				state: validationMessages.packages.state.available,
				deliveryDate: { $gte: startOfDay, $lte: endOfDay },
			})
			.exec();
	}

	async findDeliveredPackageByDeliveryMan(deliveryManId: string): Promise<Package[]> {
		return this.packageModel
			.find({
				deliveryMan: deliveryManId,
				state: validationMessages.packages.state.delivered,
			})
			.exec();
	}

	async create(createPackageDto: CreatePackageDto, userId: string): Promise<Package> {
		const newPackage = new this.packageModel({
			...createPackageDto,
			deliveryMan: null,
			state: validationMessages.packages.state.available,
		});
		await newPackage.save();

		await this.logService.create({
			action: validationMessages.log.action.packages.newPackage,
			entity: validationMessages.log.entity.package,
			entityId: newPackage._id,
			changes: createPackageDto,
			performedBy: userId,
		});

		return newPackage;
	}

	async updateById(pkgId: string, updatePackageDto: UpdatePackageDto, userId: string): Promise<Package> {
		const packageToUpdate = await this.packageModel.findById(pkgId);
		if (!packageToUpdate) {
			throw new NotFoundException(validationMessages.packages.error.packageNotFound);
		}

		const updatedPackage = await this.packageModel.findByIdAndUpdate(pkgId, updatePackageDto, { new: true }).exec();

		this.logService.create({
			action: validationMessages.log.action.packages.updateDataPkg,
			entity: validationMessages.log.entity.package,
			entityId: pkgId,
			changes: { ...updatePackageDto },
			performedBy: userId,
		});

		return updatedPackage;
	}

	async removePackage(uuidPackage: string, performedById: string): Promise<void> {
		const pkg = await this.findById(uuidPackage);
		if (!pkg) throw new NotFoundException(validationMessages.packages.error.packageNotFound);
		await this.authService.removePackageFromAllUsers(uuidPackage);

		await this.packageModel.findByIdAndDelete(uuidPackage);

		await this.logService.create({
			action: validationMessages.log.action.packages.deleted,
			entity: validationMessages.log.entity.package,
			entityId: uuidPackage,
			changes: { deleted: true },
			performedBy: performedById,
		});
	}

	async findPackages(deliveryManId: string, packageId?: string): Promise<Package | Package[] | null> {
		const user = await this.authService.findById(deliveryManId);
		if (!user) throw new Error(validationMessages.packages.userArray.userNotFound);

		if (packageId) {
			return this.packageModel.findOne({ _id: packageId, deliveryMan: deliveryManId }).exec();
		} else {
			const packageIds = user.packages;
			const packages = await this.packageModel.find({ _id: { $in: packageIds } });
			const orderedPackages = packageIds.map(id => packages.find(pkg => pkg._id.toString() === id));
			return orderedPackages;
		}
	}

	async updatePackageOnDelete(packageId: string, res: Response): Promise<void> {
		try {
			const packageToUpdate = await this.packageModel.findById(packageId);
			if (!packageToUpdate) {
				throw new NotFoundException(validationMessages.packages.error.packageNotFound);
			}

			packageToUpdate.deliveryMan = null;
			packageToUpdate.state = validationMessages.packages.state.available;
			await packageToUpdate.save();
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	async changeStateAndReorder(userId: string, uuidPackage: string, performedById: string, res: Response): Promise<Package> {
		try {
			const packageToUpdate = await this.packageModel.findById(uuidPackage);
			if (!packageToUpdate) {
				throw new NotFoundException(validationMessages.packages.error.packageNotFound);
			}

			await this.authService.reorderUserPackages(userId, uuidPackage, performedById);

			packageToUpdate.state = validationMessages.packages.state.onTheWay;
			return packageToUpdate.save();
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	async updatePackageOnCancel(packageId: string, userId: string, res: Response): Promise<void> {
		try {
			const packageToUpdate = await this.packageModel.findById(packageId).exec();
			if (!packageToUpdate) {
				throw new NotFoundException(validationMessages.packages.error.packageNotFound);
			}

			packageToUpdate.state = validationMessages.packages.state.available;
			packageToUpdate.deliveryDate = new Date();
			packageToUpdate.deliveryMan = null;
			await packageToUpdate.save();

			await this.authService.removePackageFromUser(userId, packageId);

			await this.logService.create({
				action: validationMessages.log.action.packages.updateOnCancel,
				entity: validationMessages.log.entity.package,
				entityId: packageId,
				changes: { state: packageToUpdate.state, deliveryDate: packageToUpdate.deliveryDate, deliveryMan: packageToUpdate.deliveryMan },
				performedBy: userId,
			});
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	async assignPackageToUser(userId: string, packageId: string, res: Response): Promise<void> {
		try {
			const packageToUpdate = await this.packageModel.findById(packageId).exec();
			if (!packageToUpdate) throw new NotFoundException(validationMessages.packages.error.packageNotFound);

			packageToUpdate.deliveryMan = userId;
			packageToUpdate.state = validationMessages.packages.state.pending;
			await packageToUpdate.save();

			await this.authService.loadUserPackage(userId, packageId);

			await this.logService.create({
				action: validationMessages.log.action.packages.assignPkgToUser,
				entity: validationMessages.log.entity.package,
				entityId: packageId,
				changes: { deliveryMan: userId, state: validationMessages.packages.state.pending },
				performedBy: userId,
			});
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	async finishPackage(packageId: string, userId: string): Promise<void> {
		const packageToUpdate = await this.packageModel.findById(packageId);
		if (!packageToUpdate) throw new NotFoundException(validationMessages.packages.error.packageNotFound);

		packageToUpdate.state = validationMessages.packages.state.delivered;
		packageToUpdate.deliveryMan = null;
		packageToUpdate.deliveryDate = new Date();
		await packageToUpdate.save();

		await this.logService.create({
			action: validationMessages.log.action.packages.state.delivered,
			entity: validationMessages.log.entity.package,
			entityId: packageId,
			changes: {
				state: validationMessages.packages.state.delivered,
				deliveryMan: null,
				daliveryDate: new Date(),
			},
			performedBy: userId,
		});
	}

	async findPackagesByCriteria(year: string, month: string, day: string, uuidUser?: string, includeAllStates: boolean = false): Promise<Package[]> {
		const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
		const nextDay = new Date(date);
		nextDay.setDate(date.getDate() + 1);

		const query: any = {
			deliveryDate: { $gte: date, $lt: nextDay },
		};

		if (uuidUser) {
			query.deliveryMan = uuidUser;
		}
		if (!includeAllStates) {
			query.state = validationMessages.packages.state.delivered;
		}

		return this.packageModel.find(query).exec();
	}

	async findAllPackagesWithDeliveryMan(): Promise<Package[]> {
		return this.packageModel.find({ deliveryMan: { $ne: null } }).exec();
	}

	async updatePackageState(packageId: string, newState: string): Promise<Package> {
		return this.packageModel.findByIdAndUpdate(packageId, { state: newState }, { new: true }).exec();
	}

	async clearPackageDeliveryMan(packageId: string): Promise<Package> {
		return this.packageModel.findByIdAndUpdate(packageId, { deliveryMan: null }, { new: true }).exec();
	}

	async updatePackageDeliveryDate(packageId: string, newDate: Date): Promise<Package> {
		return this.packageModel.findByIdAndUpdate(packageId, { deliveryDate: newDate }, { new: true }).exec();
	}

	async updateDeliveryDateForNonDeliveredPackages(newDate: Date): Promise<void> {
		const nonDeliveredPackages = await this.packageModel.find({ state: { $ne: validationMessages.packages.state.delivered } });

		for (const pkg of nonDeliveredPackages) {
			await this.packageModel.updateOne({ _id: pkg._id }, { $set: { deliveryDate: newDate } });

			await this.logService.create({
				action: validationMessages.log.action.packages.deliveryDate.nextDate,
				entity: validationMessages.log.entity.package,
				entityId: pkg._id,
				changes: {
					previousDate: pkg.deliveryDate,
					newDate: newDate,
				},
				performedBy: 'CRON',
			});
		}
	}
}
