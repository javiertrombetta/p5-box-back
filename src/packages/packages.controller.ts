import { Controller, Get, Post, Body, Param, Delete, ValidationPipe, Put, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { PackagesService } from './packages.service';

import { GetUser, Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

// import { validationMessages } from '../common/constants';
import { ExceptionHandlerService } from '../common/helpers';

@Controller('packages')
export class PackagesController {
	[x: string]: any;
	constructor(private readonly packagesService: PackagesService) {}

	//RUTA PARA OBTENER LISTADO DE PAQUETES DE TODOS LOS USUARIOS
	@Get('all')
	findAll() {
		return this.packagesService.findAll();
	}
	//GET packages/me/details
	//RUTA PARA VER UN PAQUETE
	@Get('users/:userid')
	findById(@Param('userid') id: string) {
		return this.packagesService.findById(id);
	}
	//GET (USER) /packages  - Obtener listado de paquetes del propio usuario / buscar el id de tu propio usuario

	//RUTA PARA VER LOS PAQUETES DISPONIBLES
	@Get('me/available')
	findAvailable() {
		return this.packagesService.findAvailable();
	}

	@Get('me/delivered')
	@Auth(ValidRoles.repartidor)
	async getDeliveredPackages(@GetUser() userId: string, @Res() res: Response) {
		try {
			const packages = await this.packagesService.findDeliveredPackageByDeliveryMan(userId);
			res.status(HttpStatus.OK).json(packages);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	//POST packages/new
	@Post('new')
	createPackage(@Body(ValidationPipe) createPackageDto: CreatePackageDto) {
		return this.packagesService.create(createPackageDto);
	}

	//GET (USER) /packages  - Obtener listado de paquetes del propio usuario / buscar el id de tu propio usuario

	//RUTA PARA CREAR UN PAQUETE DESDE EL ADMIN
	//checkear crear paquete y verificar si es delivery man que sea consistente con lo que existe, el id del reapartidor y que tenga state activo.

	//POST packages/me/finish
	//ESTE ES UN PUT NO UN POST
	// @Post('me/finish')
	// finishPackage(@Body(ValidationPipe) createPackageDto:CreatePackageDto){
	//  return this.packagesService.create(createPackageDto)
	// }

	//RUTA PARA ACTUALIZAR INFO DE UN PAQUETE DESDE EL ADMIN
	//validar que el paquete exista solo actualizar descripcion,direccion y estado.

	@Put('/me/finish')
	update(@Param('packageId') id: string, @Body(ValidationPipe) updatePackageDto: UpdatePackageDto) {
		return this.packagesService.updateById(id, updatePackageDto);
	}

	//RUTA PARA ASIGNAR UN PAQUETE A UN USUARIO DESDE EL ADMIN /ASSIGN
	//chequear que el paquete exista y validar el id del repartidor,que este activo y actualizar state a asignado
	@Put(':packageId/assign')
	assignPackage(@Param('packageId') id: string, @Body(ValidationPipe) updatePackageDto: UpdatePackageDto) {
		return this.packagesService.updateById(id, updatePackageDto);
	}

	//Hacer

	//RUTA PARA ACTUALIZAR ESTADO DE UN PAQUETE DESDE EL USER /STATE
	//ckequear que el paquete exista y que solo se pueda cambiar en pendiente,camino o entregado
	@Put(':packageId/state')
	updateState(@Param('packageId') id: string, @Body(ValidationPipe) updatePackageDto: UpdatePackageDto) {
		return this.packagesService.update(+id, updatePackageDto);
	}

	//RUTA PARA ELIMINAR UN PAQUETE DESDE EL ADMIN
	//chequear que exista el usuario antes de borrar
	@Delete(':packageId')
	remove(@Param('packageId') id: string) {
		return this.packagesService.deleteById(id);
	}
}
