import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { validationMessages } from '../constants';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
	catch(exception: UnauthorizedException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		response.status(HttpStatus.UNAUTHORIZED).json({
			statusCode: HttpStatus.UNAUTHORIZED,
			timestamp: new Date().toISOString(),
			path: request.url,
			message: validationMessages.auth.account.error.unauthorized,
		});
	}
}
