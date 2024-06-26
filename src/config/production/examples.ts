import { config } from 'dotenv';
import { connect, disconnect, model, Document } from 'mongoose';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { startOfDay } from 'date-fns';

import { UserSchema } from '../../auth/entities';
import { PackageSchema } from '../../packages/entities';
import { LogSchema } from '../../log/entities';
import { LocationSchema } from '../../locations/entities';
import { LegalDeclarationSchema } from '../../legals/entities';

import { validationMessages } from '../../common/constants';
import { ValidRoles } from '../../auth/interfaces';

config();

interface IUser extends Document {
	name: string;
	lastname: string;
	email: string;
	password: string;
	roles: string[];
	photoUrl: string;
	points: number;
}

function generatePassword(): string {
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

async function seedDB() {
	try {
		console.log(validationMessages.seed.process.seedDBConnect, process.env.MONGODB_URI);
		await connect(process.env.MONGODB_URI);

		const UserModel = model<IUser>(validationMessages.seed.models.user, UserSchema);
		const PackageModel = model(validationMessages.seed.models.packages, PackageSchema);
		const LogModel = model(validationMessages.seed.models.log, LogSchema);
		const LegalModel = model(validationMessages.seed.models.legal, LegalDeclarationSchema);
		const LocationModel = model(validationMessages.seed.models.location, LocationSchema);

		await UserModel.deleteMany({});
		await PackageModel.deleteMany({});
		await LogModel.deleteMany({});
		await LegalModel.deleteMany({});
		await LocationModel.deleteMany({});

		const repartidores = [];

		for (let i = 0; i < 20; i++) {
			const roles = [faker.helpers.arrayElement([ValidRoles.repartidor, ValidRoles.administrador])];
			const plainPassword = generatePassword();
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

			const newUser = (await UserModel.create(userData)) as any;

			if (roles.includes(ValidRoles.repartidor)) repartidores.push(newUser);

			const locationData = {
				userId: newUser._id,
				latitude: faker.location.latitude(),
				longitude: faker.location.longitude(),
			};
			await LocationModel.create(locationData);
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

				const newPackage = (await PackageModel.create(packageData)) as any;
				if (packageState !== validationMessages.packages.state.delivered) {
					packagesForRepartidor.push(newPackage._id);
				}

				if (packageState === validationMessages.packages.state.onTheWay) {
					packagesForRepartidor.unshift(packagesForRepartidor.pop());
				}
			}

			await UserModel.findByIdAndUpdate(repartidor._id, { $set: { packages: packagesForRepartidor } });
		}

		const plainPassword = validationMessages.seed.deliveryMan.password;
		const hashedPassword = await bcrypt.hash(plainPassword, 10);
		const deliveryExampleUser = {
			name: validationMessages.seed.deliveryMan.name,
			lastname: validationMessages.seed.deliveryMan.lastname,
			email: validationMessages.seed.deliveryMan.email,
			password: hashedPassword,
			roles: [ValidRoles.repartidor],
			photoUrl: faker.image.avatar(),
			points: 0,
		};
		await UserModel.create(deliveryExampleUser);

		const deliveryData = await UserModel.findOne({ email: deliveryExampleUser.email });

		if (!deliveryData) {
			throw new Error(validationMessages.auth.account.error.userNotFound);
		} else {
			const locationData = {
				userId: deliveryData._id,
				latitude: validationMessages.seed.location.latitude,
				longitude: validationMessages.seed.location.longitude,
			};
			await LocationModel.create(locationData);
		}

		console.log(validationMessages.seed.process.seedCompleted);
	} catch (error) {
		console.error(validationMessages.seed.process.seedError, error);
	} finally {
		await disconnect();
	}
}

seedDB();
