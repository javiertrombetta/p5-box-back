import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { PassportModule } from '@nestjs/passport';

@Module({
	controllers: [FilesController],
	providers: [FilesService],
	imports: [ConfigModule, PassportModule.register({ defaultStrategy: 'jwt' })],
	exports: [FilesService],
})
export class FilesModule {}
