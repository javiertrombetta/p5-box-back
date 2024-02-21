import { Inject, Injectable, NotAcceptableException, NotFoundException, forwardRef } from '@nestjs/common';
import { Response } from 'express';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Package } from './entities/package.entity';
import { validationMessages } from '../common/constants';
import { CreatePackageDto, UpdatePackageDto } from './dto';
import { AuthService } from 'src/auth/auth.service';
import { ExceptionHandlerService } from '../common/helpers';

@Injectable()
export class PackagesService {
	constructor(
		@InjectModel(Package.name) private packageModel: mongoose.Model<Package>,
		@Inject(forwardRef(() => AuthService)) private authService: AuthService,
	) {}

	async findById(id: string): Promise<Package> {
		const paquete = await this.packageModel.findById(id);
		if (!paquete) {
			throw new NotAcceptableException('No hay Paquete');
		}
		return paquete;
	}

	async findAvailablePackage(deliveryManId: string): Promise<Package[]> {
		return await this.packageModel
			.find({
				deliveryMan: deliveryManId,
				state: validationMessages.packages.state.available,
			})
			.exec();
	}
	async findAll(): Promise<Package[]> {
		return this.packageModel.find({ state: validationMessages.packages.state.delivered }).exec();
	}

	async findAvailable(): Promise<Package[]> {
		return this.packageModel.find({ state: validationMessages.packages.state.available }).exec();
	}

	async findDeliveredPackageByDeliveryMan(deliveryManId: string): Promise<Package[]> {
		return this.packageModel
			.find({
				deliveryMan: deliveryManId,
				state: validationMessages.packages.state.delivered,
			})
			.exec();
	}

	async create(createPackageDto: CreatePackageDto): Promise<Package> {
		const newPackage = new this.packageModel(createPackageDto);
		return newPackage.save();
	}

	async assignPaqueteAUsuario(userId: string, packageId: string, performedById: string, res: Response): Promise<Package> {
		try {
			const packageToUpdate = await this.packageModel.findById(packageId);
			if (!packageToUpdate) {
				throw new NotFoundException(validationMessages.packages.error.notFound);
			}

			await this.authService.updateUserPackages(userId, packageId, performedById);

			packageToUpdate.deliveryMan = userId;
			packageToUpdate.state = validationMessages.packages.state.pending;
			return packageToUpdate.save();
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	async updateById(id: string, updatePackageDto: UpdatePackageDto): Promise<Package> {
		return this.packageModel.findByIdAndUpdate(id, updatePackageDto, { new: true }).exec();
	}

	async deleteById(id: string): Promise<Package> {
		return this.packageModel.findByIdAndDelete(id).exec();
	}

	async findPackagesByDeliveryMan(deliveryManId: string): Promise<Package[]> {
		return this.packageModel.find({ deliveryMan: deliveryManId }).exec();
	}

	async findPackageByDeliveryManAndId(deliveryManId: string, packageId: string): Promise<Package | null> {
		return this.packageModel.findOne({ _id: packageId, deliveryMan: deliveryManId }).exec();
	}

	async updatePackageOnDelete(packageId: string, res: Response): Promise<void> {
		try {
			const packageToUpdate = await this.packageModel.findById(packageId);
			if (!packageToUpdate) {
				throw new NotFoundException(validationMessages.packages.error.notFound);
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
				throw new NotFoundException(validationMessages.packages.error.notFound);
			}

			await this.authService.reorderUserPackages(userId, uuidPackage, performedById);

			packageToUpdate.state = validationMessages.packages.state.onTheWay;
			return packageToUpdate.save();
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}
}
