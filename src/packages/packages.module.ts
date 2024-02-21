// src/packages/packages.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../auth/entities/user.entity';

import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { Package, PackageSchema } from './entities/package.entity';
// import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Package.name, schema: PackageSchema },
			{ name: User.name, schema: UserSchema },
		]),
		// AuthModule,
	],
	controllers: [PackagesController],
	providers: [PackagesService],
	exports: [PackagesService],
})
export class PackagesModule {}
