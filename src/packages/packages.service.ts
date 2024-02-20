import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Package } from './entities/package.entity';
import mongoose from 'mongoose';
//aqui definimos los metodos
@Injectable()
export class PackagesService {
   [x: string]: any;
   constructor(
       @InjectModel(Package.name)
       private packageModel: mongoose.Model<Package>
   ){}

   async findAll(): Promise<Package[]>{
   return await this.packageModel.find().exec()
   }

   async create(createPackageDto: CreatePackageDto): Promise<Package>{
       const paquetes = new this.packageModel(createPackageDto);
       return await paquetes.save()
   }

   async assignPaqueteAUsuario(userId: string, packageId: string): Promise<Package> {
       const packageToUpdate = await this.packageModel.findById(packageId);
 //Verifica si el paquete existe en la base de datos 
       if (!packageToUpdate) {
           throw new NotFoundException('Package not found');
       }
       // Verificar si el paquete está disponible
       if (packageToUpdate.state !== 'disponible') {
           throw new NotAcceptableException('Package no esta disponible');
       }
       // Verificar si el array de paquetes del usuario está vacío
       const user = await this.userService.findById(userId);
       if (!user || !user.packages || user.packages.length === 0) {
           throw new NotAcceptableException('El arreglo de usuario no esta vacio');
       }
       // Cambiar el estado del paquete a "pendiente"
       packageToUpdate.state = 'pendiente';

       // Asignar el id del usuario al campo deliveryMan del paquete
	   
       packageToUpdate.deliveryMan = userId;
       // Insertar el ID del paquete en el array de paquetes del usuario
       user.packages.push(packageId);
       await user.save();
  
       // Guardar los cambios en la base de datos
       return await packageToUpdate.save();
   }
  
   async updateById(id: string,updatePackageDto:UpdatePackageDto):Promise<Package>{
       return await this.packageModel.findByIdAndUpdate(id,updatePackageDto,{
           new: true,
           runValidators: true
       })
   }

   async findById(id:string):Promise<Package>{
       const paquete = await this.packageModel.findById(id)
       if(!paquete){
           throw new NotAcceptableException("No hay Paquete")
       }
       return paquete
   }

   async deleteById(id: string): Promise<Package>{
       return await this.packageModel.findByIdAndDelete(id)
   }


	// create(createPackageDto: CreatePackageDto) {
	// 	return 'This action adds a new package';
	// }

	// findAll() {
	// 	return `This action returns all packages`;
	// }

	// findOne(id: number) {
	// 	return `This action returns a #${id} package`;
	// }

	// update(id: number, updatePackageDto: UpdatePackageDto) {
	// 	return `This action updates a #${id} package`;
	// }

	// remove(id: number) {
	// 	return `This action removes a #${id} package`;
	// }
}
