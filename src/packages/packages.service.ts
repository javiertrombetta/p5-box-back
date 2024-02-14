import { Injectable, NotAcceptableException } from '@nestjs/common';
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

	async findById(id:string):Promise<Package>{
		const paquete = await this.packageModel.findById(id)
		if(!paquete){
			throw new NotAcceptableException("No hay Paquete")
		}
		return paquete
	}

	async updateById(id: string,updatePackageDto:UpdatePackageDto):Promise<Package>{
		return await this.packageModel.findByIdAndUpdate(id,updatePackageDto,{
			new: true,
			runValidators: true
		})
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
