import { HttpException, HttpStatus, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';

import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Package } from './entities/package.entity';
import { User } from '../auth/entities';
import { validationMessages } from '../common/constants';

import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
	[x: string]: any;
	constructor(
		@InjectModel(Package.name) private packageModel: mongoose.Model<Package>,
		@InjectModel(User.name) private readonly userModel: mongoose.Model<User>,
	) {}

	async findAll(): Promise<Package[]> {
		return await this.packageModel.find().exec();
	}

	async create(createPackageDto: CreatePackageDto): Promise<Package> {
		const paquetes = new this.packageModel(createPackageDto);
		return await paquetes.save();
	}

	async assignPaqueteAUsuario(userId: string, packageId: string): Promise<Package> {
		const packageToUpdate = await this.packageModel.findById(packageId);

		if (!packageToUpdate) {
			throw new NotFoundException('Package not found');
		}

		if (packageToUpdate.state !== 'disponible') {
			throw new NotAcceptableException('Package no esta disponible');
		}

		const user = await this.userService.findById(userId);
		if (!user || !user.packages || user.packages.length === 0) {
			throw new NotAcceptableException('El arreglo de usuario no esta vacio');
		}

		packageToUpdate.state = 'pendiente';

		packageToUpdate.deliveryMan = userId;

		user.packages.push(packageId);
		await user.save();

		return await packageToUpdate.save();
	}

	async updateById(id: string, updatePackageDto: UpdatePackageDto): Promise<Package> {
		return await this.packageModel.findByIdAndUpdate(id, updatePackageDto, {
			new: true,
			runValidators: true,
		});
	}

	async findById(id: string): Promise<Package> {
		const paquete = await this.packageModel.findById(id);
		if (!paquete) {
			throw new NotAcceptableException('No hay Paquete');
		}
		return paquete;
	}

	async deleteById(id: string): Promise<Package> {
		return await this.packageModel.findByIdAndDelete(id);
	}

	async findPackagesByDeliveryMan(deliveryManId: string): Promise<Package[]> {
		return this.packageModel.find({ deliveryMan: deliveryManId }).exec();
	}

	async findPackageByDeliveryManAndId(deliveryManId: string, packageId: string): Promise<Package | null> {
		return this.packageModel
			.findOne({
				_id: packageId,
				deliveryMan: deliveryManId,
			})
			.exec();
	}

	async updatePackageOnDelete(packageId: string): Promise<void> {
		const pkg = await this.packageModel.findById(packageId);
		if (!pkg) {
			throw new HttpException(validationMessages.packages.userArray.notFound, HttpStatus.NOT_FOUND);
		}
		pkg.state = validationMessages.packages.state.available;
		pkg.deliveryMan = null;
		await pkg.save();
	}

	async changeStateAndReorder(userId: string, uuidPackage: string): Promise<Package> {
		const pkg = await this.packageModel.findById(uuidPackage);
		if (!pkg) {
			throw new HttpException(validationMessages.packages.userArray.notFound, HttpStatus.NOT_FOUND);
		}

		pkg.state = validationMessages.packages.state.onTheWay;
		await pkg.save();

		const user = await this.userModel.findById(userId);
		if (!user || !Array.isArray(user.packages)) {
			throw new HttpException(validationMessages.packages.error.notFound.userArray, HttpStatus.NOT_FOUND);
		}

		const updatedPackagesOrder = [uuidPackage, ...user.packages.filter(pkgId => pkgId !== uuidPackage)];
		user.packages = updatedPackagesOrder;
		await user.save();

		const otherPackageIds = user.packages.filter(pkgId => pkgId !== uuidPackage);
		if (otherPackageIds.length > 0) {
			await this.packageModel.updateMany({ _id: { $in: otherPackageIds } }, { $set: { state: validationMessages.packages.state.pending } });
		}

		return pkg;
	}
}
