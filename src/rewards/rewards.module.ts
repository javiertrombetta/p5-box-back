import { Module, forwardRef } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { AuthModule } from '../auth/auth.module';
import { LogModule } from '../log/log.module';
import { PassportModule } from '@nestjs/passport';

@Module({
	imports: [PassportModule.register({ defaultStrategy: 'jwt' }), forwardRef(() => AuthModule), LogModule],
	controllers: [RewardsController],
	providers: [RewardsService],
	exports: [RewardsService],
})
export class RewardsModule {}
