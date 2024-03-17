import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User, UserSchema } from './entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtStrategy } from './strategies/jwt.strategy';

import { MailModule } from '../mail/mail.module';
import { PackagesModule } from '../packages/packages.module';
import { LogModule } from '../log/log.module';
import { LegalDeclarationsModule } from '../legals/legals.module';
import { RewardsModule } from '../rewards/rewards.module';
import { PhotosModule } from '../photos/photos.module';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
	imports: [
		ConfigModule,
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: { expiresIn: '2h' },
			}),
			global: true,
			inject: [ConfigService],
		}),
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		MailModule,
		forwardRef(() => PackagesModule),
		LogModule,
		forwardRef(() => LegalDeclarationsModule),
		forwardRef(() => RewardsModule),
		PhotosModule,
	],
	providers: [AuthService, JwtStrategy, GoogleStrategy],
	controllers: [AuthController],
	exports: [JwtStrategy, PassportModule, JwtModule, AuthService],
})
export class AuthModule {}
