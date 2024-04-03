import { Module } from '@nestjs/common';

import { PackagesModule } from '../packages/packages.module';
import { LogModule } from '../log/log.module';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';
import { RewardsModule } from '../rewards/rewards.module';

import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
	imports: [PassportModule.register({ defaultStrategy: 'jwt' }), AuthModule, PackagesModule, LogModule, RewardsModule],
	controllers: [TasksController],
	providers: [TasksService],
})
export class TasksModule {}
