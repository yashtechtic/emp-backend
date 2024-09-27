import { forwardRef, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HandleMembershipCron } from './handle-membership';
import { UserGroupModule } from '@app/modules/user-group/user-group.module';

@Module({
  imports: [ScheduleModule.forRoot(), forwardRef(() => UserGroupModule)],
  providers: [HandleMembershipCron],
})
export class CronModule {}
