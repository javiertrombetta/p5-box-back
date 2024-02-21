import { ExceptionFilter, Catch, ArgumentsHost, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { validationMessages } from '../constants';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.NOT_FOUND;

		response.status(status).json({
			statusCode: status,
			message: validationMessages.auth.error.urlNotFound,
		});
	}
}
