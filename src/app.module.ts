import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { PackagesModule } from './packages/packages.module';
import { RewardsModule } from './rewards/rewards.module';
import { CommonModule } from './common/common.module';
import { LocationsModule } from './locations/locations.module';

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'public'),
		}),
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get('MONGODB_URI'),
			}),
			inject: [ConfigService],
		}),
		AuthModule,
		SeedModule,
		PackagesModule,
		RewardsModule,
		CommonModule,
		LocationsModule,
	],
})
export class AppModule {}
