import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { User } from './entities/user.entity';
import { RoleMenu } from '../company-roles/entities/company-role-menu.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { GeneralUtility } from '@app/utilities/general.utility';
import { CommonConfigModule } from '@app/common-config';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RoleMenu]),
    ServicesModule,
    UtilitiesModule,
    CommonConfigModule,
    CompanyModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, GeneralUtility],
})
export class UsersModule {}
