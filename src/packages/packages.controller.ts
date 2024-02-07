import { Controller, Get, Post, Body, Param, Delete,ValidationPipe, Put } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Controller('packages')
export class PackagesController {
    constructor(private readonly packagesService: PackagesService) {}

//Ruta post debe ser de admin
    @Post()
    create(@Body(ValidationPipe) createPackageDto: CreatePackageDto) {
        return this.packagesService.create(createPackageDto);
    }

//Ruta get debe ser de user
    @Get()
    findAll() {
        return this.packagesService.findAll();
    }

//Ruta get debe ser de user admin , me falta una ruta mas de get
    @Get(':userid')
    findOne(@Param('userid') id: string) {
        return this.packagesService.findOne(+id);
    }
	
//Ruta patch  debe ser de user
    @Put(':packageId/state')
    updateState(@Param('packageId') id: string, @Body(ValidationPipe) updatePackageDto: UpdatePackageDto) {
        return this.packagesService.update(+id, updatePackageDto);
    }

//Ruta patch  debe ser de admin
    @Put(':packageId/assign')
    assignPackage(@Param('packageId') id: string, @Body(ValidationPipe) updatePackageDto: UpdatePackageDto) {
        return this.packagesService.update(+id, updatePackageDto);
    }

//Ruta patch  debe ser de user
    @Put(':packageId')
    update(@Param('packageId') id: string, @Body(ValidationPipe) updatePackageDto: UpdatePackageDto) {
        return this.packagesService.update(+id, updatePackageDto);
    }
//Ruta delete debe ser de admin
    @Delete(':packageId')
    remove(@Param('packageId') id: string) {
        return this.packagesService.remove(+id);
    }
}
