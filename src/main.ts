import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function main() {
	const app = await NestFactory.create(AppModule);
	app.use(cookieParser());
	app.enableCors({
		methods: 'GET,POST,PUT,DELETE',
		credentials: true,
	});
	app.setGlobalPrefix('api/v1');
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	);
	await app.listen(3000);
}
main();
