import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserGroupService } from '@app/modules/user-group/user-group.service';

@Injectable()
export class HandleMembershipCron {
  private readonly logger = new Logger(HandleMembershipCron.name);

  constructor(
    @Inject(forwardRef(() => UserGroupService))
    private readonly userGroupService: UserGroupService
  ) {}

  @Cron('*/5 * * * * *') // This cron expression means every 5 seconds
  // @Cron('0 6 * * *') // This cron expression means every day at 6 AM
  async execute() {
    console.log('helloo i am cron=============');
    // await this.userGroupService.handleMembershipCron();
  }
}
