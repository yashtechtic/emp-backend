import { Module } from '@nestjs/common';

import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralUtility } from '@app/utilities/general.utility';
import { Roles } from './entities/company-role.entity';
import { RoleMenu } from './entities/company-role-menu.entity';
import { CompanyRolesService } from './company-roles.service';
import { CompanyRolesController } from './company-roles.controller';
import { RoleCategory } from './entities/company-role-category.entity';
import { CapabilityGroupsDepartments } from './entities/capability-groups-dept.entity';
import { RoleUser } from './entities/role-users.entity';
import { GroupToRole } from '../user-group/entity/group-role-association.entity';
import { UserGroupModule } from '../user-group/user-group.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Roles,
      RoleCategory,
      RoleMenu,
      CapabilityGroupsDepartments,
      RoleUser,
      GroupToRole,
    ]),
    ServicesModule,
    UtilitiesModule,
    UserGroupModule,
  ],
  controllers: [CompanyRolesController],
  providers: [CompanyRolesService, GeneralUtility],
})
export class CompanyRolesModule {}
