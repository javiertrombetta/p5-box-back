import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { LogModule } from '../log/log.module';
import { PassportModule } from '@nestjs/passport';
import { PackagesModule } from '../packages/packages.module';

import { RewardsController } from './rewards.controller';

import { RewardsService } from './rewards.service';

@Module({
	imports: [PassportModule.register({ defaultStrategy: 'jwt' }), forwardRef(() => AuthModule), forwardRef(() => PackagesModule), LogModule],
	controllers: [RewardsController],
	providers: [RewardsService],
	exports: [RewardsService],
})
export class RewardsModule {}
