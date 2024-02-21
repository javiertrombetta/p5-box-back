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

			if (typeof response === 'object' && response !== null) {
				if ('message' in response) {
					res.status(status).json(response);
				} else {
					res.status(status).json({
						message: response['error'] ? response['error'] : validationMessages.error.handler.unexpected,
					});
				}
			} else if (typeof response === 'string') {
				res.status(status).json({ message: response });
			} else {
				res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
					message: validationMessages.error.handler.unexpected,
				});
			}
		} else {
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				message: validationMessages.error.handler.unexpected,
			});
		}
	}
}
