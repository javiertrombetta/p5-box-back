import { Module, forwardRef } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { AuthModule } from '../auth/auth.module';
import { LogModule } from '../log/log.module';
import { PassportModule } from '@nestjs/passport';
import { PackagesModule } from 'src/packages/packages.module';

@Module({
	imports: [PassportModule.register({ defaultStrategy: 'jwt' }), forwardRef(() => AuthModule), forwardRef(() => PackagesModule), LogModule],
	controllers: [RewardsController],
	providers: [RewardsService],
	exports: [RewardsService],
})
export class RewardsModule {}
