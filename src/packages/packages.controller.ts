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


	@Get('users/me/:userid')
	findById(@Param('userid') id: string) {
		return this.packagesService.findById(id);
	}

   @Get('me/available')
   @Auth(ValidRoles.repartidor)
   async getAvailablePackages(@GetUser() user, @Res() res: Response){
      try {
         const packages = await this.packagesService.
         findAvailablePackage(user.id)
         res.status(HttpStatus.OK).json(packages)
      } catch (error) {
         ExceptionHandlerService.handleException(error, res)
      }
   }
 
	@Get('me/delivered')
	// @Auth(ValidRoles.repartidor)
	async getDeliveredPackages(@GetUser() user, @Res() res: Response) {
		try {
			const packages = await this.packagesService.findDeliveredPackageByDeliveryMan(user.id);
			res.status(HttpStatus.OK).json(packages);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Post('new')
	createPackage(@Body(ValidationPipe) createPackageDto: CreatePackageDto) {
		return this.packagesService.create(createPackageDto);
	}

	@Put('/me/finish')
	update(@Param('packageId') id: string, @Body(ValidationPipe) updatePackageDto: UpdatePackageDto) {
		return this.packagesService.updateById(id, updatePackageDto);
	}

	@Put(':packageId/assign')
	assignPackage(@Param('packageId') id: string, @Body(ValidationPipe) updatePackageDto: UpdatePackageDto) {
		return this.packagesService.updateById(id, updatePackageDto);
	}

	@Put(':packageId/state')
	updateState(@Param('packageId') id: string, @Body(ValidationPipe) updatePackageDto: UpdatePackageDto) {
		return this.packagesService.update(+id, updatePackageDto);
	}

	@Delete(':packageId')
	remove(@Param('packageId') id: string) {
		return this.packagesService.deleteById(id);
	}
}
