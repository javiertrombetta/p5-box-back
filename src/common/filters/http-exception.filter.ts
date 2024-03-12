import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { validationMessages } from '../constants';

@Catch(Error)
export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();

		const message = exception instanceof Error ? exception.message : validationMessages.serverError.internal;

		response.status(status).json({
			message,
			timestamp: new Date().toISOString(),
		});
	}
}
