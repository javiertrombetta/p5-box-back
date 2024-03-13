import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { validationMessages } from '../constants';

@Injectable()
export class ExceptionHandlerService {
	static handleException(error: any, res: Response) {
		console.error(error);
		if (error instanceof HttpException) {
			const status = error.getStatus();
			const response = error.getResponse();

			let message = validationMessages.serverError.unexpected;

			if (typeof response === 'object' && response !== null) {
				message = response['message'] || response['error'] || message;
			} else if (typeof response === 'string') {
				message = response;
			}
			res.status(status).json({ message: message });
		} else {
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				message: validationMessages.serverError.unexpected,
			});
		}
	}
}
