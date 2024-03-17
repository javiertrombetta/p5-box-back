import { Controller, Get, Post, Body, Param, Delete, ValidationPipe, Put, Res, HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { PackagesService } from './packages.service';
import { GetUser, Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { ExceptionHandlerService } from '../common/helpers';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { validationMessages } from '../common/constants';

@ApiTags('Packages')
@Controller('packages')
export class PackagesController {
	constructor(private readonly packagesService: PackagesService) {}

	@Get('available')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtener paquetes disponibles', description: 'Este endpoint requiere autenticación y tener rol repartidor.' })
	@ApiResponse({ status: 200, description: 'Paquetes disponibles obtenidos con éxito.' })
	@ApiResponse({ status: 401, description: 'No autorizado.' })
	@Auth(ValidRoles.repartidor)
	async getAvailablePackages(@Res() res: Response) {
		try {
			const packages = await this.packagesService.findAvailablePackagesForToday();
			res.status(HttpStatus.OK).json(packages);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('me/delivered')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtener paquetes entregados por mi', description: 'Este endpoint requiere autenticación y tener rol repartidor.' })
	@ApiResponse({ status: 200, description: 'Paquetes entregados obtenidos con éxito.' })
	@ApiResponse({ status: 401, description: 'No autorizado.' })
	@Auth(ValidRoles.repartidor)
	async getDeliveredPackages(@GetUser() user, @Res() res: Response) {
		try {
			const packages = await this.packagesService.findPackagesByDeliveryManIdAndState(user.id, validationMessages.packages.state.delivered);
			res.status(HttpStatus.OK).json(packages);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('me/:uuidPackage/details')
	@ApiOperation({ summary: 'Detalles del paquete específico del listado de repartos', description: 'Este endpoint requiere autenticación y tener rol repartidor.' })
	@ApiBearerAuth()
	@ApiParam({ name: 'uuidPackage', type: 'string', description: 'UUID del paquete del listado de paquetes', required: true, example: '123e4567-e89b-12d3-a456-426614174000' })
	@ApiResponse({ status: 200, description: 'Detalles del paquete retornados exitosamente.' })
	@ApiResponse({ status: 404, description: 'Paquete no encontrado.' })
	@ApiResponse({ status: 401, description: 'No autorizado.' })
	@Auth(ValidRoles.repartidor)
	async getPackageDetails(@Param('uuidPackage') uuidPackage: string, @GetUser('id') userId: string, @Res() res: Response) {
		try {
			const packageDetails = await this.packagesService.findPackagesByDeliveryMan(userId, uuidPackage);
			if (!packageDetails) throw new HttpException(validationMessages.packages.userArray.packageNotFound, HttpStatus.NOT_FOUND);

			res.json(packageDetails);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('at/:uuidPackage/available')
	@ApiOperation({ summary: 'Detalles de paquete disponible', description: 'Este endpoint requiere autenticación y tener rol repartidor.' })
	@ApiBearerAuth()
	@ApiParam({ name: 'uuidPackage', type: 'string', description: 'UUID del paquete disponible', required: true, example: '123e4567-e89b-12d3-a456-426614174000' })
	@ApiResponse({ status: 200, description: 'Detalles del paquete disponible retornados exitosamente.' })
	@ApiResponse({ status: 404, description: 'Paquete no disponible o no encontrado.' })
	@ApiResponse({ status: 401, description: 'No autorizado.' })
	@Auth(ValidRoles.repartidor)
	async getAvailablePackageDetails(@Param('uuidPackage') uuidPackage: string, @Res() res: Response) {
		try {
			const pkg = await this.packagesService.findPackagesByIdAndAvailableState(uuidPackage);
			if (!pkg) {
				return res.status(HttpStatus.NOT_FOUND).json({ message: validationMessages.packages.error.packageNotAvailable });
			}
			res.status(HttpStatus.OK).json(pkg);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Post('new')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Crear un nuevo paquete', description: 'Este endpoint requiere autenticación y tener rol administrador.' })
	@ApiBearerAuth()
	@ApiBody({ type: CreatePackageDto })
	@ApiResponse({ status: 201, description: 'Paquete creado exitosamente.' })
	@ApiResponse({ status: 400, description: 'Datos inválidos.' })
	@ApiResponse({ status: 401, description: 'No autorizado.' })
	@Auth(ValidRoles.administrador)
	async createPackage(@Body() createPackageDto: CreatePackageDto, @GetUser('id') userId: string, @Res() res: Response) {
		try {
			const newPackage = await this.packagesService.create(createPackageDto, userId);
			res.status(HttpStatus.CREATED).json(newPackage);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Put('at/:packageId/assign')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Asignarse un paquete al listado de repartos', description: 'Este endpoint requiere autenticación y tener rol repartidor.' })
	@ApiParam({ name: 'packageId', type: 'string', description: 'UUID del paquete a asignarse', required: true, example: '123e4567-e89b-12d3-a456-426614174000' })
	@ApiResponse({ status: 200, description: 'Paquete asignado correctamente.' })
	@ApiResponse({ status: 400, description: 'Datos inválidos.' })
	@ApiResponse({ status: 401, description: 'No autorizado.' })
	@ApiResponse({ status: 404, description: 'Paquete no encontrado.' })
	@Auth(ValidRoles.repartidor)
	async assignPackage(@Param('packageId') pkgId: string, @Body(ValidationPipe) updatePackageDto: UpdatePackageDto, @GetUser() user, @Res() res: Response) {
		try {
			const assignedPackage = await this.packagesService.updateById(pkgId, updatePackageDto, user.id);
			res.status(HttpStatus.OK).json(assignedPackage);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Put('at/:packageId/state')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Actualizar el estado de un paquete', description: 'Este endpoint requiere autenticación y tener rol administrador.' })
	@ApiParam({ name: 'packageId', type: 'string', description: 'UUID del paquete a cambiar de estado', required: true, example: '123e4567-e89b-12d3-a456-426614174000' })
	@ApiResponse({ status: 200, description: 'Estado del paquete actualizado correctamente.' })
	@ApiResponse({ status: 400, description: 'Datos inválidos.' })
	@ApiResponse({ status: 401, description: 'No autorizado.' })
	@ApiResponse({ status: 404, description: 'Paquete no encontrado.' })
	@Auth(ValidRoles.administrador)
	async updateState(@Param('packageId') pkgId: string, @Body(ValidationPipe) updatePackageDto: UpdatePackageDto, @GetUser() user, @Res() res: Response) {
		try {
			const updatedPackageState = await this.packagesService.updateById(pkgId, updatePackageDto, user.id);
			res.status(HttpStatus.OK).json(updatedPackageState);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Delete('at/:uuidPackage/remove')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Eliminar un paquete', description: 'Este endpoint requiere autenticación y tener rol administrador.' })
	@ApiParam({ name: 'uuidPackage', type: 'string', description: 'UUID del paquete a eliminar', required: true, example: '123e4567-e89b-12d3-a456-426614174000' })
	@ApiResponse({ status: 200, description: 'Paquete eliminado correctamente.' })
	@ApiResponse({ status: 401, description: 'No autorizado.' })
	@ApiResponse({ status: 404, description: 'Paquete no encontrado.' })
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
