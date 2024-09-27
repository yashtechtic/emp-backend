import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { AdminService } from './admin.service';

import { Admin } from './entities/admin.entity';

import { CapabilityMaster } from '../admin-role/entities/admin-role-capability-master.entity';
import { GeneralUtility } from '@app/utilities/general.utility';
import { CommonConfigModule } from '@app/common-config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, CapabilityMaster]),
    ServicesModule,
    UtilitiesModule,
    CommonConfigModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, GeneralUtility],
})
export class AdminModule {}
