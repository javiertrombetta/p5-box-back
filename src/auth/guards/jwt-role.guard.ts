import { Injectable, CanActivate, ExecutionContext, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../entities/user.entity';

@Injectable()
export class JwtRoleGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const validRoles = this.reflector.get<string[]>('roles', context.getHandler());

		if (!validRoles) {
			return true;
		}
		const request = context.switchToHttp().getRequest();
		const user: User = request.user;

		if (!user) {
			throw new BadRequestException('User not found in request.');
		}

		if (validRoles.includes(user.role)) {
			return true;
		} else {
			throw new ForbiddenException(`User role ${user.role} is not authorized to access this resource.`);
		}
	}
}
