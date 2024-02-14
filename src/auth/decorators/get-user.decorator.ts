import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { validationMessages } from '../../common/constants';

export const GetUser = createParamDecorator(async (data: string, ctx: ExecutionContext) => {
	const req = ctx.switchToHttp().getRequest();
	const jwtService = new JwtService({ secret: process.env.JWT_SECRET });

	const token = req.cookies['Authentication'];
	if (!token) {
		throw new UnauthorizedException(validationMessages.auth.token.notFound);
	}

	try {
		const decoded = jwtService.verify(token);
		return !data ? decoded : decoded[data];
	} catch (error) {
		throw new UnauthorizedException(validationMessages.auth.token.notFound);
	}
});
