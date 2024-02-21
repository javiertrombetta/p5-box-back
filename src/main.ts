import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnauthorizedExceptionFilter, NotFoundExceptionFilter } from './common/filters';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function main() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);

	app.use(cookieParser());
	app.enableCors({
		origin: configService.get('CORS_ORIGIN'),
		methods: configService.get('CORS_METHODS'),
		credentials: configService.get('CORS_CREDENTIALS') === 'true',
	});

	app.useGlobalFilters(new UnauthorizedExceptionFilter(), new NotFoundExceptionFilter());

	app.setGlobalPrefix(configService.get('GLOBAL_PREFIX'));
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

	await app.listen(configService.get('PORT') || 3000);
}
main();
