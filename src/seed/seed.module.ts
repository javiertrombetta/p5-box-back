import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module'; // Asegúrate de que la ruta sea correcta
import { User, UserSchema } from '../auth/entities/user.entity';
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
		AuthModule,
	],
	controllers: [SeedController],
	providers: [SeedService, PackagesService],
})
export class SeedModule {}
