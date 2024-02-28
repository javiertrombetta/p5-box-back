import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import axios from 'axios';

describe('User controllers E2E Test', () => {
	let app: INestApplication;
	let createdUserId: any;
	let usersData: any;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		(usersData = [
			{
				name: 'Test',
				lastname: 'Ing',
				email: 'test4444444@gmail.com',
				password: 'Plataforma5',
				photoUrl: 'Photo',
			},
			{
				name: 'Test',
				lastname: 'Ing',
				email: 'test22222222@gmail.com',
				password: 'slas',
				photoUrl: 'Photo',
			},
			{
				name: 'Test',
				lastname: 'Ing',
				email: 'test333333333@gmail.com',
				password: 'Plataforma5',
				photoUrl: 'Photo',
			},
			{
				email: 'test4444444@gmail.com',
				password: 'Plataforma5',
			},
			{
				email: 'no_registrado@gmail.com',
				password: 'Plataforma5',
			},
		]),
			(app = moduleFixture.createNestApplication());
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	// 	async function deleteUser(userId: string) {
	// 	try {
	// 		await User.findOneAndDelete(userId);
	// 		console.log('usuario eliminado');
	// 	} catch (error) {
	// 		console.error('error al eliminar el usuario:', error);
	// 	}
	// }

	describe('Post /auth/register', () => {
		it('should create a new user', async () => {
			const response = await request(app.getHttpServer()).post('/auth/register').send(usersData[0]);

			expect(response.status).toBe(HttpStatus.CREATED);
			expect(response.body.message).toEqual('Usuario registrado con éxito.');
			// createdUserId = response.body.id;
			// await deleteUser(createdUserId)
		});

		it('should fail to create a new user with duplicate email', async () => {
			const response1 = await request(app.getHttpServer()).post('/auth/register').send(usersData[1]);

			expect(response1.status).toBe(HttpStatus.CREATED);
			// const firstUserId = response1.body.id;
			const response2 = await request(app.getHttpServer()).post('/auth/register').send(usersData[1]);

			expect(response2.status).toBe(HttpStatus.CONFLICT);
		});
	});

	describe('Post /auth/login', () => {
		let cookie = '';

		it('should login the user successfully', async () => {
			const response = await axios.post('http://localhost:3000/api/v1/auth/login', usersData[3]);
			expect(response.status).toBe(HttpStatus.OK);
			expect(response.data.message).toEqual('Usuario logueado con éxito.');
		});

		it('no deberia poder loguearse si no esta registrado', async () => {
			try {
				const response = await axios.post('http://localhost:3000/api/v1/auth/login', usersData[4]);
				expect(response.status).not.toBe(HttpStatus.OK);
				expect(response.data.message).toEqual('El usuario no fue encontrado.');
			} catch (error) {
				expect(error.response.status).toBe(HttpStatus.UNAUTHORIZED);
				expect(error.response.data.message).toEqual('El usuario no fue encontrado.');
			}
		});
	});
});
