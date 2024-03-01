import { Controller, Get, Post, Body, Param, Delete, ValidationPipe, Put, Res, HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { PackagesService } from './packages.service';
import { GetUser, Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { ExceptionHandlerService } from '../common/helpers';
import { ApiTags } from '@nestjs/swagger';
import { validationMessages } from '../common/constants';

@ApiTags('Packages')
@Controller('packages')
export class PackagesController {
	constructor(private readonly packagesService: PackagesService) {}

	@Get('available')
	@Auth(ValidRoles.repartidor)
	async getAvailablePackages(@Res() res: Response) {
		try {
			const packages = await this.packagesService.findAvailablePackage();
			res.status(HttpStatus.OK).json(packages);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('/me/delivered')
	@Auth(ValidRoles.repartidor)
	async getDeliveredPackages(@GetUser() user, @Res() res: Response) {
		try {
			const packages = await this.packagesService.findDeliveredPackageByDeliveryMan(user.id);
			res.status(HttpStatus.OK).json(packages);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('at/:uuidPackage/details')
	@Auth(ValidRoles.repartidor)
	async getPackageDetails(@Param('uuidPackage') uuidPackage: string, @GetUser('id') userId: string, @Res() res: Response) {
		try {
			const packageDetails = await this.packagesService.findPackages(userId, uuidPackage);
			if (!packageDetails) throw new HttpException(validationMessages.packages.userArray.packageNotFound, HttpStatus.NOT_FOUND);

			res.json(packageDetails);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Post('new')
	@Auth(ValidRoles.administrador)
	async createPackage(@Body() createPackageDto: CreatePackageDto, @GetUser('id') userId: string) {
		return this.packagesService.create(createPackageDto, userId);
	}

	@Put('finish')
	@Auth(ValidRoles.repartidor)
	update(@Param('packageId') pkgId: string, @GetUser() user, @Body(ValidationPipe) updatePackageDto: UpdatePackageDto) {
		return this.packagesService.updateById(pkgId, updatePackageDto, user.id);
	}

	@Put('at/:packageId/assign')
	@Auth(ValidRoles.repartidor)
	assignPackage(@Param('packageId') pkgId: string, @Body(ValidationPipe) updatePackageDto: UpdatePackageDto, @GetUser() user) {
		return this.packagesService.updateById(pkgId, updatePackageDto, user.id);
	}

	@Put('at/:packageId/state')
	@Auth(ValidRoles.administrador)
	updateState(@Param('packageId') pkgId: string, @Body(ValidationPipe) updatePackageDto: UpdatePackageDto, @GetUser() user) {
		return this.packagesService.updateById(pkgId, updatePackageDto, user.id);
	}

	@Delete('at/:uuidPackage/remove')
	@Auth(ValidRoles.administrador)
	async removePackage(@Param('uuidPackage') uuidPackage: string, @GetUser('id') userId: string, @Res() res: Response) {
		try {
			await this.packagesService.removePackage(uuidPackage, userId);
			res.status(HttpStatus.OK).json({ message: validationMessages.packages.success.deleted });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}
}
