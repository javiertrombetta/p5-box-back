import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LogService } from './log.service';
import { LogController } from './log.controller';
import { Log, LogSchema } from './entities';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]), forwardRef(() => AuthModule)],
	controllers: [LogController],
	providers: [LogService],
	exports: [LogService],
})
export class LogModule {}
