import { HttpStatus, INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing";
import * as request from 'supertest';
import { AppModule } from "./../src/app.module";


describe('Package controllers E2E Test', () => {

    let app: INestApplication;
    let createdPackageId: any;
    let packageData: any;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        packageData = {
            deliveryFullname: 'hola',
            deliveryAddress: 'San Martin 123',
            deliveryWeight: '1234',
            deliveryMan: 'John',
            daliveryDate: new Date()
            };
            app = moduleFixture.createNestApplication();
            await app.init()
    })

    afterEach(async() => {
        await app.close();
     });

     describe('(POST) /packages/new ',() => {
        xit('(POST)Deberia crear un nuevo paquete', async() => {
            const response = await request(app.getHttpServer()).post('/packages/new').send(packageData)

            expect(response.status).toBe(HttpStatus.CREATED);
            createdPackageId = response.body.id
        });

        xit('/packages/:packageId', () => {
            const response = request(app.getHttpServer().delete('/packages/:packageId'))
            expect(response).toBe(HttpStatus.NOT_FOUND)
        
        })

})


})
