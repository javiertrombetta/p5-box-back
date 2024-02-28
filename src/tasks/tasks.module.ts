import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PackagesModule } from '../packages/packages.module';
import { LogModule } from '../log/log.module';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [PassportModule.register({ defaultStrategy: 'jwt' }), AuthModule, PackagesModule, LogModule],
	providers: [TasksService],
})
export class TasksModule {}
