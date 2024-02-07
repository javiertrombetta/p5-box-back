import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtRoleGuard } from '../guards/jwt-role.guard';
import { ValidRoles } from '../interfaces';
import { RoleProtected } from './';

export function Auth(...roles: ValidRoles[]) {
	return applyDecorators(RoleProtected(...roles), UseGuards(AuthGuard(), JwtRoleGuard));
}
