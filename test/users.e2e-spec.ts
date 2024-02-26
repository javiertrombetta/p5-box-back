import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { response } from 'express';

describe('User controllers E2E Test', () => {
	let app: INestApplication;
	let createdUserId: any;
	let usersData: any;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		usersData = [
			{
				name: 'Test',
				lastname: 'Ing',
				email: 'test105@gmail.com',
				password: 'Plataforma5',
				photoUrl: 'Photo',
			},
			{
				name: 'Test',
				lastname: 'Ing',
				email: 'test106@gmail.com',
				password: 'slas',
				photoUrl: 'Photo',
			},
			{
				name: 'Test',
				lastname: 'Ing',
				email: 'test107@gmail.com',
				password: 'Plataforma5',
				photoUrl: 'Photo',
			},
			{
				name: 'Test',
				lastname: 'Ing',
				email: 'test108@gmail.com',
				password: 'Plataforma5',
				photoUrl: 'Photo',
			},
		];
		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	describe('Post /auth/register', () => {
		it('should create a new user', async () => {
			const response = await request(app.getHttpServer()).post('/auth/register').send(usersData[0]);

			expect(response.status).toBe(HttpStatus.CREATED);
			createdUserId = response.body.id;
		});

		it('Should fail if password is less than 6 characters', async () => {
			const response = await request(app.getHttpServer()).post('/auth/register').send(usersData[1]);
			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should fail to create a new user with duplicate email', async () => {
			const response1 = await request(app.getHttpServer()).post('/auth/register').send(usersData[2]);

			expect(response1.status).toBe(HttpStatus.CREATED);
			const firstUserId = response1.body.id;
			const response2 = await request(app.getHttpServer()).post('/auth/register').send(usersData[2]);

			expect(response2.status).toBe(HttpStatus.CONFLICT);
		});
	});

	describe('Post /auth/login', () => {
		xit('should log in with a user that exists', async () => {
			const response1 = await request(app.getHttpServer()).post('/auth/register').send(usersData[3]);

			expect(response1.status).toBe(HttpStatus.CREATED);

			const response2 = await request(app.getHttpServer()).post('/auth/login').send({ email: usersData[3].email, password: usersData[2].password });

			expect(response2.status).toBe(HttpStatus.ACCEPTED);
		});
	});
});
