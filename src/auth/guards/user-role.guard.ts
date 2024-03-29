import { HttpException, CanActivate, ExecutionContext, Injectable, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { User } from '../entities/user.entity';
import { META_ROLES } from '../decorators/role-protected.decorator';
import { validationMessages } from '../../common/constants';

@Injectable()
export class UserRoleGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler());

		if (!validRoles) return true;
		if (validRoles.length === 0) return true;

		const req = context.switchToHttp().getRequest();
		const user = req.user as User;

		if (!user) throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.BAD_REQUEST);

		const userHasValidRole = validRoles.some(role => user.roles.includes(role));

		if (!userHasValidRole) {
			const forbiddenMessage = validationMessages.auth.user.role.forbidden
				.replace('${user.name}', user.name)
				.replace('${user.lastname}', user.lastname)
				.replace('${validRoles}', validRoles.join(', '));
			throw new HttpException(forbiddenMessage, HttpStatus.FORBIDDEN);
		}

		return true;
	}
}
