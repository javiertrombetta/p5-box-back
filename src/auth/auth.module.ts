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
			inject: [ConfigService],
		}),
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		MailModule,
		forwardRef(() => PackagesModule),
		LogModule,
	],
	providers: [AuthService, JwtStrategy],
	controllers: [AuthController],
	exports: [JwtStrategy, PassportModule, JwtModule, AuthService],
})
export class AuthModule {}
