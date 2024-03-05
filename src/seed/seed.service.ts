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

import { validationMessages } from '../common/constants';
import { ValidRoles } from 'src/auth/interfaces';

@Injectable()
export class SeedService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		@InjectModel(Package.name) private readonly packageModel: Model<Package>,
		@InjectModel(Log.name) private readonly logModel: Model<Log>,
		@InjectModel(Location.name) private readonly locationModel: Model<Location>,
	) {}

	async populateDB() {
		await this.userModel.deleteMany({});
		await this.packageModel.deleteMany({});
		await this.logModel.deleteMany({});
		await this.locationModel.deleteMany({});

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

			for (let j = 0; j < Math.floor(Math.random() * 10) + 1; j++) {
				const packageData = {
					deliveryFullname: faker.person.fullName(),
					deliveryAddress: `${faker.location.streetAddress({ useFullAddress: true })}`,
					deliveryWeight: faker.number.float({ min: 1, max: 100, multipleOf: 0.25 }),
					deliveryDate: startOfDay(faker.date.soon()),
					state: faker.helpers.arrayElement([
						validationMessages.packages.state.available,
						validationMessages.packages.state.delivered,
						validationMessages.packages.state.onTheWay,
						validationMessages.packages.state.pending,
					]),
					deliveryMan: repartidor._id,
				};

				const newPackage = await new this.packageModel(packageData).save();
				packagesForRepartidor.push(newPackage._id);
			}

			await this.userModel.findByIdAndUpdate(repartidor._id, { $set: { packages: packagesForRepartidor } });
		}

		return { message: validationMessages.seed.success.seedCompleted };
	}

	generatePassword(): string {
		const passwordLength = 10;
		const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
		const digitChars = '0123456789';
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
