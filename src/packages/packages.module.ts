// src/packages/packages.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { Package, PackageSchema } from './entities/package.entity';

@Module({
	imports: [MongooseModule.forFeature([{ name: Package.name, schema: PackageSchema }])],
	controllers: [PackagesController],
	providers: [PackagesService],
})
export class PackagesModule {}
