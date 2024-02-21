import { Package } from './entities/package.entity';
import { PackagesService } from './packages.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { NotAcceptableException } from '@nestjs/common';

describe('packagesService', () => {
	let packagesService: PackagesService;
	let model: Model<Package>;

	const simuloPaquete = {
		_id: '1234',
		description: 'hola',
		deliveryAddress: 'San Juan',
		enum: 'Pendiente',
		deliveryMan: 'Walter White',
	};

	const mockPackageService = {
		findById: jest.fn(),
	};

	beforeEach(async () => {
		jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PackagesService,
				{
					provide: getModelToken(Package.name),
					useValue: mockPackageService,
				},
			],
		}).compile();

		packagesService = module.get<PackagesService>(PackagesService);
		model = module.get<Model<Package>>(getModelToken(Package.name));
	});

	describe('findById', () => {
		it('Deberia encontrar y retornar un paquete por ID', async () => {
			jest.spyOn(model, 'findById').mockResolvedValue(simuloPaquete);

			const result = await packagesService.findById(simuloPaquete._id);
			expect(model.findById).toHaveBeenCalledWith(simuloPaquete._id);
			expect(result).toEqual(simuloPaquete);
		});

		it('Deberia retornar NotFoundException si el paquete no es encontrado', async () => {
			jest.spyOn(model, 'findById').mockResolvedValue(null);

			await expect(packagesService.findById(simuloPaquete._id)).rejects.toThrow(NotAcceptableException);

			expect(model.findById).toHaveBeenCalledWith(simuloPaquete._id);
		});
	});
});
