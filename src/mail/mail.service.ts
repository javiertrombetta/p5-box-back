import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import { validationMessages } from '../common/constants';

@Injectable()
export class MailService {
	private transporter: nodemailer.Transporter;

	constructor() {
		this.transporter = nodemailer.createTransport({
			services: process.env.SMTP_SERVICES,
			host: process.env.SMTP_HOST as string,
			port: parseInt(process.env.SMTP_PORT as string, 10),
			secure: true,
			auth: {
				user: process.env.SMTP_USER as string,
				pass: process.env.SMTP_PASSWORD as string,
			},
		} as nodemailer.TransportOptions);
	}

	sendMail(to: string, subject: string, content: string): void {
		setImmediate(async () => {
			try {
				await this.transporter.sendMail({
					from: `${process.env.SMTP_FROM} <${process.env.SMTP_USER}>`,
					to: to,
					subject: subject,
					html: content,
				});
			} catch (error) {
				throw new Error(validationMessages.auth.forgotPassword.error);
			}
		});
	}
}
