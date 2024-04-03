import { config } from 'dotenv';

import { connect, disconnect, model, Document } from 'mongoose';
import { UserSchema } from '../../auth/entities';

import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

import { ValidRoles } from '../../auth/interfaces';
import { validationMessages } from '../../common/constants';

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

export async function createAdminUser(): Promise<void> {
	try {
		console.log(validationMessages.seed.process.seedDBConnect, process.env.MONGODB_URI);
		await connect(process.env.MONGODB_URI);

		const UserModel = model<IUser>(validationMessages.seed.models.user, UserSchema);

		const plainPassword = validationMessages.seed.administrator.password;
		const hashedPassword = await bcrypt.hash(plainPassword, 10);
		const adminData = {
			name: validationMessages.seed.administrator.name,
			lastname: validationMessages.seed.administrator.lastname,
			email: validationMessages.seed.administrator.email,
			password: hashedPassword,
			roles: [ValidRoles.administrador],
			photoUrl: faker.image.avatar(),
			points: 0,
		};
		const existingAdmin = await UserModel.findOne({ email: adminData.email });
		if (!existingAdmin) {
			await UserModel.create(adminData);
			console.log(validationMessages.seed.process.seedCompleted);
		}
	} catch (error) {
		console.error(validationMessages.seed.process.seedError, error);
	} finally {
		await disconnect();
	}
}

createAdminUser();
