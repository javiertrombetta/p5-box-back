import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { PackagesModule } from '../packages/packages.module';
import { PassportModule } from '@nestjs/passport';

@Module({
	imports: [PassportModule.register({ defaultStrategy: 'jwt' }), PackagesModule],
	controllers: [LocationsController],
	providers: [LocationsService],
})
export class LocationsModule {}
