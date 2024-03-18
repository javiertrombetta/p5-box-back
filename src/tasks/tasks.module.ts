import { Module } from '@nestjs/common';

import { PackagesModule } from '../packages/packages.module';
import { LogModule } from '../log/log.module';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';
import { RewardsModule } from '../rewards/rewards.module';

import { TasksService } from './tasks.service';

@Module({
	imports: [PassportModule.register({ defaultStrategy: 'jwt' }), AuthModule, PackagesModule, LogModule, RewardsModule],
	providers: [TasksService],
})
export class TasksModule {}
