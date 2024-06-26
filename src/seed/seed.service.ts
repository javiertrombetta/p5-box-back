import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { startOfDay } from 'date-fns';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from '../auth/entities';
import { Package } from '../packages/entities';
import { Log } from '../log/entities';
import { Location } from '../locations/entities';
import { LegalDeclaration } from '../legals/entities';

import { LocationsService } from '../locations/locations.service';

import { validationMessages } from '../common/constants';
import { ValidRoles } from '../auth/interfaces';

@Injectable()
export class SeedService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		@InjectModel(Package.name) private readonly packageModel: Model<Package>,
		@InjectModel(Log.name) private readonly logModel: Model<Log>,
		@InjectModel(Location.name) private readonly locationModel: Model<Location>,
		@InjectModel(LegalDeclaration.name) private readonly legalDeclarationModel: Model<LegalDeclaration>,
		private readonly locationsService: LocationsService,
	) {}

	async populateDB() {
		await this.userModel.deleteMany({});
		await this.packageModel.deleteMany({});
		await this.logModel.deleteMany({});
		await this.locationModel.deleteMany({});
		await this.legalDeclarationModel.deleteMany({});

		const repartidores = [];

		for (let i = 0; i < 20; i++) {
			const roles = [faker.helpers.arrayElement([ValidRoles.repartidor, ValidRoles.administrador])];
			const plainPassword = this.generatePassword();
			const hashedPassword = await bcrypt.hash(plainPassword, 10);
			const photoUrl = faker.image.avatar();

			const userData = {
				name: faker.person.firstName(),
				lastname: faker.person.lastName(),
				email: faker.internet.email().toLowerCase(),
				password: hashedPassword,
				roles,
				photoUrl,
				points: faker.number.int({ min: 0, max: 100 }),
			};

			const newUser = await new this.userModel(userData).save();

			if (roles.includes(ValidRoles.repartidor)) repartidores.push(newUser);

			const locationData = {
				userId: newUser._id,
				latitude: faker.location.latitude(),
				longitude: faker.location.longitude(),
			};
			await new this.locationModel(locationData).save();
		}

		for (const repartidor of repartidores) {
			const packagesForRepartidor = [];
			let packageInTransitCreated = false;

			for (let j = 0; j < Math.floor(Math.random() * 50) + 1; j++) {
				let packageState = faker.helpers.arrayElement([
					validationMessages.packages.state.available,
					validationMessages.packages.state.delivered,
					validationMessages.packages.state.onTheWay,
					validationMessages.packages.state.pending,
				]);

				if (packageState === validationMessages.packages.state.onTheWay && packageInTransitCreated) {
					packageState = validationMessages.packages.state.pending;
				} else if (packageState === validationMessages.packages.state.onTheWay) {
					packageInTransitCreated = true;
				}

				let deliveryManId = null;
				if (packageState !== validationMessages.packages.state.available) {
					deliveryManId = repartidor._id;
				}
				const packageData = {
					deliveryFullname: faker.person.fullName(),
					deliveryAddress: `${faker.location.streetAddress({ useFullAddress: true })}`,
					deliveryWeight: faker.number.float({ min: 1, max: 100, multipleOf: 0.25 }),
					deliveryDate: startOfDay(faker.date.soon()),
					state: packageState,
					deliveryMan: deliveryManId,
				};

				const newPackage = await new this.packageModel(packageData).save();
				if (packageState !== validationMessages.packages.state.delivered) {
					packagesForRepartidor.push(newPackage._id);
				}
				if (packageState === validationMessages.packages.state.onTheWay) {
					packagesForRepartidor.unshift(packagesForRepartidor.pop());
				}
			}

			await this.userModel.findByIdAndUpdate(repartidor._id, { $set: { packages: packagesForRepartidor } });
		}

		const adminPassword = validationMessages.seed.administrator.password;
		const deliveryPassword = validationMessages.seed.deliveryMan.password;

		const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
		const hashedDeliveryPassword = await bcrypt.hash(deliveryPassword, 10);

		const adminUser = {
			name: validationMessages.seed.administrator.name,
			lastname: validationMessages.seed.administrator.lastname,
			email: validationMessages.seed.administrator.email,
			password: hashedAdminPassword,
			roles: [ValidRoles.administrador],
			photoUrl: faker.image.avatar(),
		};

		const deliveryUser = {
			name: validationMessages.seed.deliveryMan.name,
			lastname: validationMessages.seed.deliveryMan.lastname,
			email: validationMessages.seed.deliveryMan.email,
			password: hashedDeliveryPassword,
			roles: [ValidRoles.repartidor],
			photoUrl: faker.image.avatar(),
		};

		await this.userModel.create(adminUser);
		await this.userModel.create(deliveryUser);

		const deliveryData = await this.userModel.findOne({ email: deliveryUser.email });
		if (!deliveryData) {
			throw new Error(validationMessages.auth.account.error.userNotFound);
		}
		const specificLocationData = {
			latitude: validationMessages.seed.location.latitude,
			longitude: validationMessages.seed.location.longitude,
		};

		await this.locationsService.updateUserLocation(deliveryData._id.toString(), specificLocationData);

		return { message: validationMessages.seed.process.seedCompleted };
	}

	generatePassword(): string {
		const passwordLength = 10;
		const upperCaseChars = validationMessages.seed.defaults.upperCaseChars;
		const lowerCaseChars = validationMessages.seed.defaults.lowerCaseChars;
		const digitChars = validationMessages.seed.defaults.digitChars;
		const allChars = upperCaseChars + lowerCaseChars + digitChars;

		let password = '';
		password += faker.helpers.arrayElement([...upperCaseChars]);
		password += faker.helpers.arrayElement([...lowerCaseChars]);
		password += faker.helpers.arrayElement([...digitChars]);

		for (let i = 3; i < passwordLength; i++) {
			password += faker.helpers.arrayElement([...allChars]);
		}
		return password;
	}
}
