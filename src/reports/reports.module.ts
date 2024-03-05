import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { LogModule } from '../log/log.module';
import { PackagesModule } from '../packages/packages.module';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [PassportModule.register({ defaultStrategy: 'jwt' }), LogModule, PackagesModule, AuthModule],
	controllers: [ReportsController],
	providers: [ReportsService],
})
export class ReportsModule {}
