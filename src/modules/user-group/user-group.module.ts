import { Module } from '@nestjs/common';
import { UserGroupService } from './user-group.service';
import { UserGroupController } from './user-group.controller';

import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupUser } from './entity/user-group.entity';
import { Group } from './entity/group.entity';
import { GroupToRole } from './entity/group-role-association.entity';
import { FieldValue } from './../dynamic-forms/entities/field-value.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from '../users/entities/user.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Group, GroupUser, GroupToRole, FieldValue, User]),
    ServicesModule,
    UtilitiesModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [UserGroupController],
  providers: [UserGroupService],
  exports: [UserGroupService],
})
export class UserGroupModule {}
