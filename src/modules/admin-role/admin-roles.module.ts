import { Module } from '@nestjs/common';

import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleMasterController } from './admin-roles.controller';
import { RoleMasterService } from './admin-roles.service';
import { Roles } from './entities/admin-role.entity';
import { CapabilityMaster } from './entities/admin-role-capability-master.entity';
import { CapabilityCategory } from './entities/admin-role-capability.entity';
import { GeneralUtility } from '@app/utilities/general.utility';

@Module({
  imports: [
    TypeOrmModule.forFeature([Roles, CapabilityCategory, CapabilityMaster]),
    ServicesModule,
    UtilitiesModule,
  ],
  controllers: [RoleMasterController],
  providers: [RoleMasterService, GeneralUtility],
})
export class RoleMasterModule {}
