import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/entities/user.entity';

import { PackagesModule } from '../packages/packages.module';
import { Package, PackageSchema } from '../packages/entities/package.entity';

import { LogModule } from '../log/log.module';
import { Log, LogSchema } from '../log/entities';

import { LocationsModule } from '../locations/locations.module';
import { Location, LocationSchema } from '../locations/entities';

import { LegalDeclarationsModule } from '../legals/legals.module';
import { LegalDeclaration, LegalDeclarationSchema } from '../legals/entities';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Package.name, schema: PackageSchema },
			{ name: Log.name, schema: LogSchema },
			{ name: Location.name, schema: LocationSchema },
			{ name: LegalDeclaration.name, schema: LegalDeclarationSchema },
		]),
		AuthModule,
		PackagesModule,
		LogModule,
		LocationsModule,
		LegalDeclarationsModule,
	],
	controllers: [SeedController],
	providers: [SeedService],
})
export class SeedModule {}
