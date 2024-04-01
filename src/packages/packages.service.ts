import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Package } from './entities/package.entity';
import { validationMessages } from '../common/constants';
import { CreatePackageDto, UpdatePackageDto } from './dto';
import { AuthService } from '../auth/auth.service';
import { LogService } from '../log/log.service';
import { RewardsService } from '../rewards/rewards.service';

@Injectable()
export class PackagesService {
	constructor(
		@InjectModel(Package.name) private packageModel: mongoose.Model<Package>,
		@Inject(forwardRef(() => AuthService)) private authService: AuthService,
		@Inject(forwardRef(() => RewardsService)) private rewardsService: RewardsService,
		private logService: LogService,
	) {}

	async findPackagesById(id: string): Promise<Package> {
		const paquete = await this.packageModel.findById(id);
		if (!paquete) throw new NotFoundException(validationMessages.packages.error.packageNotFound);
		return paquete;
	}

	async findPackagesByDeliveryMan(deliveryManId: string, packageId?: string): Promise<Package | Package[] | null> {
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

	async findPackagesByIdAndAvailableState(packageId: string): Promise<Package | null> {
		return this.packageModel
			.findOne({
				_id: packageId,
				state: validationMessages.packages.state.available,
			})
			.exec();
	}

	async findPackagesByDeliveryManIdAndState(deliveryManId: string, state: string): Promise<Package[]> {
		return this.packageModel
			.find({
				deliveryMan: deliveryManId,
				state: state,
			})
			.exec();
	}

	async findAvailablePackagesForToday(): Promise<Package[]> {
		const now = new Date();
		const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
		const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

		return this.packageModel
			.find({
				state: validationMessages.packages.state.available,
				deliveryDate: { $gte: startOfDay, $lte: endOfDay },
			})
			.sort({ deliveryDate: -1 })
			.exec();
	}

	async findPackagesByCriteria(year?: string, month?: string, day?: string, uuidUser?: string, includeAllDelivered: boolean = false): Promise<Package[]> {
		const query: any = {};

		if (!includeAllDelivered) {
			const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
			const nextDay = new Date(date);
			nextDay.setDate(date.getDate() + 1);

			query.deliveryDate = { $gte: date, $lt: nextDay };
		}

		if (uuidUser) {
			query.deliveryMan = uuidUser;
		}

		query.state = validationMessages.packages.state.delivered;

		return this.packageModel.find(query).exec();
	}

	async findPackagesByDateAndOptionalState(deliveryDate: Date, state?: string): Promise<Package[]> {
		const startDate = new Date(Date.UTC(deliveryDate.getUTCFullYear(), deliveryDate.getUTCMonth(), deliveryDate.getUTCDate()));
		const endDate = new Date(Date.UTC(deliveryDate.getUTCFullYear(), deliveryDate.getUTCMonth(), deliveryDate.getUTCDate(), 23, 59, 59, 999));

		const query: any = {
			deliveryDate: {
				$gte: startDate,
				$lt: endDate,
			},
		};

		if (state) {
			query.state = state;
		}

		return this.packageModel.find(query).exec();
	}

	async findAllPackagesWithDeliveryMan(): Promise<Package[]> {
		return this.packageModel
			.find({
				deliveryMan: { $ne: null },
				state: { $ne: validationMessages.packages.state.delivered },
			})
			.exec();
	}

	async create(createPackageDto: CreatePackageDto, userId: string): Promise<Package> {
		if (isNaN(createPackageDto.deliveryDate.getTime())) {
			throw new Error(validationMessages.packages.deliveryDate.dateNotValid);
		}

		createPackageDto.deliveryDate.setHours(0, 0, 0, 0);

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

	async countAssignedPackagesByDateAndDeliveryman(year: string, month: string, day: string, deliverymanId: string): Promise<number> {
		const dateStart = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
		const dateEnd = new Date(dateStart);
		dateEnd.setDate(dateStart.getDate() + 1);

		const filter = {
			deliveryMan: deliverymanId,
			deliveryDate: { $gte: dateStart, $lt: dateEnd },
		};

		return this.packageModel.countDocuments(filter).exec();
	}

	async countDeliveredPackagesByDateAndDeliveryman(year: string, month: string, day: string, deliverymanId: string): Promise<number> {
		const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
		const nextDay = new Date(date);
		nextDay.setDate(date.getDate() + 1);

		return this.packageModel
			.countDocuments({
				deliveryDate: { $gte: date, $lt: nextDay },
				deliveryMan: deliverymanId,
				state: 'entregado',
			})
			.exec();
	}

	async updateById(pkgId: string, updatePackageDto: UpdatePackageDto, userId: string): Promise<Package> {
		const packageToUpdate = await this.packageModel.findById(pkgId);
		if (!packageToUpdate) throw new NotFoundException(validationMessages.packages.error.packageNotFound);

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

	async updatePackageOnDelete(packageId: string): Promise<void> {
		const packageToUpdate = await this.packageModel.findById(packageId);
		if (!packageToUpdate) throw new NotFoundException(validationMessages.packages.error.packageNotFound);

		packageToUpdate.deliveryMan = null;
		packageToUpdate.state = validationMessages.packages.state.available;
		await packageToUpdate.save();
	}

	async updatePackageOnCancel(packageId: string, userId: string): Promise<void> {
		const user = await this.authService.findById(userId);
		if (!user) throw new NotFoundException(validationMessages.auth.account.error.notFound);

		if (!user.packages.includes(packageId)) throw new NotFoundException(validationMessages.packages.userArray.packageNotAssigned);

		const packageToUpdate = await this.packageModel.findById(packageId).exec();
		if (!packageToUpdate) throw new NotFoundException(validationMessages.packages.error.packageNotFound);

		packageToUpdate.state = validationMessages.packages.state.available;
		packageToUpdate.deliveryDate = new Date();
		// packageToUpdate.deliveryMan = null;
		await packageToUpdate.save();

		await this.authService.removePackageFromUser(userId, packageId);
		await this.rewardsService.subtractPointsForCancellation(userId);
		await this.logService.create({
			action: validationMessages.log.action.packages.updateOnCancel,
			entity: validationMessages.log.entity.package,
			entityId: packageId,
			changes: { state: packageToUpdate.state, deliveryDate: packageToUpdate.deliveryDate, deliveryMan: packageToUpdate.deliveryMan },
			performedBy: userId,
		});
	}

	async updatePackageState(packageId: string, newState: string): Promise<Package> {
		return this.packageModel.findByIdAndUpdate(packageId, { state: newState }, { new: true }).exec();
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

	async changeStateAndReorder(userId: string, uuidPackage: string, performedById: string): Promise<Package> {
		const isPackageAssigned = await this.authService.isPackageAssignedToUser(userId, uuidPackage);
		if (!isPackageAssigned) throw new NotFoundException(validationMessages.packages.userArray.packageNotFound);

		const user = await this.authService.findById(userId);
		if (!user) throw new NotFoundException(validationMessages.auth.account.error.notFound);

		const packageToUpdate = await this.packageModel.findByIdAndUpdate(
			uuidPackage,
			{
				$set: { state: validationMessages.packages.state.onTheWay },
			},
			{ new: true },
		);
		if (!packageToUpdate) throw new NotFoundException(validationMessages.packages.error.packageNotFound);

		const reorderedPackages = [uuidPackage, ...user.packages.filter(packageId => packageId !== uuidPackage)];
		await this.authService.updatePackages(userId, reorderedPackages);

		await this.logService.create({
			action: validationMessages.log.action.user.array.startNewDelivery,
			entity: validationMessages.log.entity.user,
			entityId: uuidPackage,
			changes: {
				oldState: packageToUpdate.state,
				newState: validationMessages.packages.state.onTheWay,
				reorderedPackages: reorderedPackages,
			},
			performedBy: performedById,
		});

		return packageToUpdate;
	}

	async assignPackageToUser(userId: string, packageId: string): Promise<void> {
		const user = await this.authService.findById(userId);
		if (user.packages.length >= 10) {
			throw new HttpException(validationMessages.packages.userArray.dailyDeliveryLimit, HttpStatus.BAD_REQUEST);
		}
		const packageToUpdate = await this.packageModel.findById(packageId).exec();
		if (!packageToUpdate) throw new NotFoundException(validationMessages.packages.error.packageNotFound);

		packageToUpdate.deliveryMan = userId;
		packageToUpdate.state = validationMessages.packages.state.pending;
		await packageToUpdate.save();

		await this.authService.updatePackages(userId, packageId);

		await this.logService.create({
			action: validationMessages.log.action.packages.assignPkgToUser,
			entity: validationMessages.log.entity.package,
			entityId: packageId,
			changes: { deliveryMan: userId, state: validationMessages.packages.state.pending },
			performedBy: userId,
		});
	}

	async verifyPackageExistence(packageIds: string[]): Promise<string[]> {
		const notFoundPackages = [];
		for (const packageId of packageIds) {
			const exists = await this.packageModel.findById(packageId).exec();
			if (!exists) {
				notFoundPackages.push(packageId);
			}
		}
		return notFoundPackages;
	}

	async finishPackage(packageId: string, userId: string): Promise<void> {
		const packageToUpdate = await this.packageModel.findById(packageId);
		if (!packageToUpdate) throw new NotFoundException(validationMessages.packages.error.packageNotFound);

		packageToUpdate.state = validationMessages.packages.state.delivered;
		packageToUpdate.deliveryDate = new Date();
		await packageToUpdate.save();

		await this.rewardsService.addPointsForDelivery(userId);

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

	async clearPackageDeliveryMan(packageId: string): Promise<Package> {
		return this.packageModel.findByIdAndUpdate(packageId, { deliveryMan: null }, { new: true }).exec();
	}

	async removePackage(uuidPackage: string, performedById: string): Promise<void> {
		const pkg = await this.findPackagesById(uuidPackage);
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
}
