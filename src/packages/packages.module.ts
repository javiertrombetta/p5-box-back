// src/packages/packages.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { Package, PackageSchema } from './entities/package.entity';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';
import { LogModule } from '../log/log.module';

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: 'jwt' }),
		MongooseModule.forFeature([{ name: Package.name, schema: PackageSchema }]),
		forwardRef(() => AuthModule),
		LogModule,
	],
	controllers: [PackagesController],
	providers: [PackagesService],
	exports: [PackagesService],
})
export class PackagesModule {}
