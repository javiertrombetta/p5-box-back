import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/entities/user.entity';

import { PackagesModule } from '../packages/packages.module';
import { Package, PackageSchema } from '../packages/entities/package.entity';

import { LogModule } from '../log/log.module';
import { Log, LogSchema } from '../log/entities';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Location, LocationSchema } from 'src/locations/entities';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Package.name, schema: PackageSchema },
			{ name: Log.name, schema: LogSchema },
			{ name: Location.name, schema: LocationSchema },
		]),
		AuthModule,
		PackagesModule,
		LogModule,
	],
	controllers: [SeedController],
	providers: [SeedService],
})
export class SeedModule {}
