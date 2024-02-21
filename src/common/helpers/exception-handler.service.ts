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
			res.status(status).json(response);
		} else {
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				message: validationMessages.auth.error.internal,
			});
		}
	}
}
