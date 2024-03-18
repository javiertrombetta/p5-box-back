import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { MockDatabase } from './config/database/mockDatabase';
import { validationMessages } from '../src/common/constants';
import { ValidRoles } from '../src/auth/interfaces';

describe('AuthController (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		await MockDatabase.start();

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
		app.use(cookieParser());
	});

	beforeEach(async () => {
		await MockDatabase.cleanDatabase();
	});

	afterAll(async () => {
		await MockDatabase.stop();
		await app.close();
	});

	describe('User registration and login', () => {
		const testUser = {
			name: 'Juan',
			lastname: 'Pérez',
			email: 'testuser@example.com',
			password: 'Password123',
		};

		it('should successfully register a new user', async () => {
			const response = await request(app.getHttpServer()).post('/auth/register').send(testUser).expect(201);

			expect(response.body.message).toContain(validationMessages.auth.account.success.registered);
		});

		it('should fail to register a user with an existing email', async () => {
			await request(app.getHttpServer())
				.post('/auth/register')
				.send(testUser)
				.expect(409)
				.expect(res => {
					expect(res.body.message).toContain(validationMessages.auth.user.email.inUse);
				});
		});

		let userAuthToken: string;

		it('should successfully log in the registered user', async () => {
			const loginResponse = await request(app.getHttpServer())
				.post('/auth/login')
				.send({
					email: testUser.email,
					password: testUser.password,
				})
				.expect(200);

			expect(loginResponse.body.token).toBeDefined();
			userAuthToken = loginResponse.body.token;
		});

		it('should fail to log in with incorrect credentials', async () => {
			await request(app.getHttpServer())
				.post('/auth/login')
				.send({
					email: testUser.email,
					password: 'wrongPassword',
				})
				.expect(401)
				.expect({
					message: validationMessages.auth.account.error.wrongCredentials,
				});
		});

		describe('Profile and packages', () => {
			beforeAll(async () => {
				await request(app.getHttpServer())
					.post('/packages/create')
					.set('Authorization', `Bearer ${userAuthToken}`)
					.send({ ...packageData })
					.expect(201);
			});

			it('should retrieve the profile of the currently logged-in user', async () => {
				await request(app.getHttpServer())
					.get('/auth/me')
					.set('Authorization', `Bearer ${userAuthToken}`)
					.expect(200)
					.expect(res => {
						expect(res.body.email).toEqual(testUser.email);
					});
			});

			const packageData = {
				deliveryFullname: 'Jorge García',
				deliveryAddress: 'Calle Falsa 123',
				deliveryWeight: 30,
				deliveryDate: new Date(),
			};

			it('should retrieve packages for the currently logged-in delivery man', async () => {
				await request(app.getHttpServer())
					.get('/auth/me/packages')
					.set('Authorization', `Bearer ${userAuthToken}`)
					.expect(200)
					.expect(res => {
						expect(res.body).toEqual(
							expect.arrayContaining([
								expect.objectContaining({
									deliveryFullname: packageData.deliveryFullname,
									deliveryAddress: packageData.deliveryAddress,
									deliveryWeight: packageData.deliveryWeight,
									deliveryDate: packageData.deliveryDate,
								}),
							]),
						);
					});
			});

			it('should return an empty array if no packages are assigned to the delivery man', async () => {
				const newUser = {
					name: 'NoPackage',
					lastname: 'User',
					email: 'nopackage@example.com',
					password: 'password123',
				};

				await request(app.getHttpServer()).post('/auth/register').send(newUser).expect(201);
				const loginResponse = await request(app.getHttpServer())
					.post('/auth/login')
					.send({
						email: newUser.email,
						password: newUser.password,
					})
					.expect(200);

				const newUserToken = loginResponse.body.token;

				await request(app.getHttpServer())
					.get('/auth/me/packages')
					.set('Authorization', `Bearer ${newUserToken}`)
					.expect(200)
					.expect(res => {
						expect(res.body).toEqual([]);
					});
			});
		});
	});
	describe('/auth/users (GET)', () => {
		let adminAuthToken: string;
		let nonAdminAuthToken: string;

		beforeAll(async () => {
			const adminUser = {
				name: 'Admin',
				lastname: 'User',
				email: 'adminuser@example.com',
				password: 'Admin123',
				roles: [ValidRoles.administrador],
			};
			await request(app.getHttpServer()).post('/auth/register').send(adminUser).expect(201);

			const loginAdminResponse = await request(app.getHttpServer())
				.post('/auth/login')
				.send({
					email: 'adminuser@example.com',
					password: 'Admin123',
				})
				.expect(200);
			adminAuthToken = loginAdminResponse.body.token;

			const nonAdminUser = {
				name: 'Regular',
				lastname: 'User',
				email: 'regular@example.com',
				password: 'Password123',
			};
			await request(app.getHttpServer()).post('/auth/register').send(nonAdminUser).expect(201);

			const loginNonAdminResponse = await request(app.getHttpServer())
				.post('/auth/login')
				.send({
					email: 'regular@example.com',
					password: 'Password123',
				})
				.expect(200);
			nonAdminAuthToken = loginNonAdminResponse.body.token;
		});

		it('should retrieve all users for an admin user', async () => {
			await request(app.getHttpServer())
				.get('/auth/users')
				.set('Authorization', `Bearer ${adminAuthToken}`)
				.expect(200)
				.expect(res => {
					expect(Array.isArray(res.body)).toBeTruthy();
					expect(res.body.length).toBeGreaterThan(0);
				});
		});

		it('should not allow a non-admin user to retrieve all users', async () => {
			await request(app.getHttpServer()).get('/auth/users').set('Authorization', `Bearer ${nonAdminAuthToken}`).expect(403); // Esperando un código de estado que indique prohibido
		});
	});
});
