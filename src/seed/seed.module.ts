import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from '../users/users.service';
import { User, UserSchema } from '../users/entities/user.entity';
import { Package, PackageSchema } from '../packages/entities/package.entity';
import { PackagesService } from '../packages/packages.service';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Package.name, schema: PackageSchema },
		]),
	],
	controllers: [SeedController],
	providers: [SeedService, UsersService, PackagesService],
})
export class SeedModule {}
