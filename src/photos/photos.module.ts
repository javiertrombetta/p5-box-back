import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PhotosService } from './photos.service';
import { PhotoController } from './photos.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';

@Module({
	controllers: [PhotoController],
	providers: [PhotosService],
	imports: [ConfigModule, PassportModule.register({ defaultStrategy: 'jwt' }), forwardRef(() => AuthModule)],
	exports: [PhotosService],
})
export class PhotosModule {}
