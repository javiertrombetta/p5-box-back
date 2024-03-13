import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { validationMessages } from '../constants';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = validationMessages.serverError.internal;

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();
			message = typeof exceptionResponse === 'string' ? exceptionResponse : exceptionResponse['message'];
		} else if (exception instanceof Error) {
			message = exception.message;
		}

		response.status(status).json({
			message,
			timestamp: new Date().toISOString(),
			path: request.url,
		});
	}
}
