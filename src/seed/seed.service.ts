import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/entities/user.entity';
import { Package } from '../packages/entities/package.entity';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { validationMessages } from '../common/constants';

@Injectable()
export class SeedService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		@InjectModel(Package.name) private readonly packageModel: Model<Package>,
	) {}

	async populateDB() {
		await this.userModel.deleteMany({});
		await this.packageModel.deleteMany({});

		const repartidores = [];

		for (let i = 0; i < 20; i++) {
			const roles = [faker.helpers.arrayElement(['repartidor', 'administrador'])];

			const plainPassword = this.generatePassword();
			const hashedPassword = await bcrypt.hash(plainPassword, 10);

			const userData = {
				name: faker.person.firstName(),
				lastname: faker.person.lastName(),
				email: faker.internet.email().toLowerCase(),
				password: hashedPassword,
				roles,
				points: faker.number.int({ min: 0, max: 100 }),
			};

			const newUser = await new this.userModel(userData).save();

			if (roles.includes('repartidor')) {
				repartidores.push(newUser);
			}
		}

		for (const repartidor of repartidores) {
			const packagesForRepartidor = [];

			for (let j = 0; j < Math.floor(Math.random() * 10) + 1; j++) {
				const packageData = {
					description: faker.commerce.productDescription(),
					deliveryAddress: faker.location.streetAddress(),
					state: faker.helpers.arrayElement(['pendiente', 'en camino', 'entregado']),
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
