import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';
import { validationMessages } from '../../common/constants/validation-messages.constants';
import { ValidRoles } from '../interfaces/valid-roles';

export class UpdateUserRoleDto {
	@IsArray({ message: validationMessages.auth.user.role.isArray })
	@IsEnum(ValidRoles, { each: true, message: validationMessages.auth.user.role.isEnum })
	@ApiProperty({
		description: validationMessages.swagger.user.roles,
		example: [ValidRoles.administrador, ValidRoles.repartidor],
		isArray: true,
	})
	roles: ValidRoles[];
}
