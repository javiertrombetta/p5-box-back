import { join } from 'path';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { SeedModule } from './seed/seed.module';
import { PackagesModule } from './packages/packages.module';
import { ReportsModule } from './reports/reports.module';
import { RewardsModule } from './rewards/rewards.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'public'),
		}),
		MongooseModule.forRoot('mongodb://localhost:27017/box-api'),
		UsersModule,
		SeedModule,
		PackagesModule,
		ReportsModule,
		RewardsModule,
	],
	controllers: [],
	providers: [],
	exports: [],
})
export class AppModule {}
