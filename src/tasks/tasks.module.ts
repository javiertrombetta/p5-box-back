import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PackagesModule } from '../packages/packages.module';
import { LogModule } from '../log/log.module';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';
import { RewardsModule } from 'src/rewards/rewards.module';

@Module({
	imports: [PassportModule.register({ defaultStrategy: 'jwt' }), AuthModule, PackagesModule, LogModule, RewardsModule],
	providers: [TasksService],
})
export class TasksModule {}
