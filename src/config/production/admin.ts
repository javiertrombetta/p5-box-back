import { AuthService } from '../../auth/auth.service';

import { ValidRoles } from 'src/auth/interfaces';
import { validationMessages } from 'src/common/constants';

export async function createAdminUser(authService: AuthService): Promise<void> {
	const adminData = {
		name: validationMessages.seed.administrator.name,
		lastname: validationMessages.seed.administrator.lastname,
		email: validationMessages.seed.administrator.email,
		password: validationMessages.seed.administrator.password,
	};

	const existingAdmin = await authService.findByEmail(adminData.email);

	if (!existingAdmin) {
		await authService.register(adminData);
		const newAdmin = await authService.findByEmail(adminData.email);
		await authService.updateUserRole(newAdmin._id, [ValidRoles.administrador], newAdmin._id.toString());
	}
}
