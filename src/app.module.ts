import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { PackagesModule } from './packages/packages.module';
import { RewardsModule } from './rewards/rewards.module';
import { CommonModule } from './common/common.module';
import { LocationsModule } from './locations/locations.module';
import { MailModule } from './mail/mail.module';
import { LogModule } from './log/log.module';
import { ReportsModule } from './reports/reports.module';
import { TasksModule } from './tasks/tasks.module';
import { LegalDeclarationsModule } from './legals/legals.module';
import { JoiValidationDevSchema, JoiValidationProdSchema } from './config';
import { PhotosModule } from './photos/photos.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: process.env.NODE_ENV !== 'production' ? JoiValidationDevSchema : JoiValidationProdSchema,
		}),
		ScheduleModule.forRoot(),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'public'),
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get('MONGODB_URI'),
			}),
			inject: [ConfigService],
		}),
		AuthModule,
		...(process.env.NODE_ENV !== 'production' ? [SeedModule, TasksModule] : []),
		PackagesModule,
		RewardsModule,
		CommonModule,
		LocationsModule,
		MailModule,
		LogModule,
		ReportsModule,
		LegalDeclarationsModule,
		PhotosModule,
	],
})
export class AppModule {}
