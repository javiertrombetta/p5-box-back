import { Module, forwardRef } from '@nestjs/common';
import { LegalDeclarationsService } from './legals.service';
import { LegalDeclarationsController } from './legals.controller';
import { LegalDeclaration, LegalDeclarationSchema } from './entities';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: 'jwt' }),
		MongooseModule.forFeature([{ name: LegalDeclaration.name, schema: LegalDeclarationSchema }]),
		forwardRef(() => AuthModule),
		forwardRef(() => RewardsModule),
	],
	controllers: [LegalDeclarationsController],
	providers: [LegalDeclarationsService],
	exports: [LegalDeclarationsService],
})
export class LegalDeclarationsModule {}
