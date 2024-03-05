import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { PackagesModule } from '../packages/packages.module';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { Location, LocationSchema } from './entities';

@Module({
	imports: [PassportModule.register({ defaultStrategy: 'jwt' }), PackagesModule, MongooseModule.forFeature([{ name: Location.name, schema: LocationSchema }])],
	controllers: [LocationsController],
	providers: [LocationsService],
})
export class LocationsModule {}
