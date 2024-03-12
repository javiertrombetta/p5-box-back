import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter, UnauthorizedExceptionFilter, NotFoundExceptionFilter } from './common/filters';

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
		credentials: true,
	});

	app.useGlobalFilters(new AllExceptionsFilter(), new UnauthorizedExceptionFilter(), new NotFoundExceptionFilter());

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

	const config = new DocumentBuilder().setTitle('BOX | Full documentation of RestAPI routes').setVersion('1.0').build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	await app.listen(configService.get('PORT') || 3000);
}
main();
