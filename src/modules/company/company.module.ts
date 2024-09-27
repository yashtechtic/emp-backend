import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { Company } from './entities/company.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanySubscription } from './entities/company-subscription.entity';
import { CompanyScriptService } from './company-script.service';
import { Roles } from '../company-roles/entities/company-role.entity';
import { User } from '../users/entities/user.entity';
import { GeneralUtility } from '@app/utilities/general.utility';
import { SubscriptionService } from '../subscription/subscription.service';
import { Subscription } from '../subscription/entities/subscription.entity';
import { CompanySetting } from './entities/company-setting.entity';
import { Group } from '../user-group/entity/group.entity';
import { GroupUser } from '../user-group/entity/user-group.entity';
import { Settings } from '../settings/entities/setting.entity';
import { Country } from '../country/entities/country.entity';
import { State } from '../state/entities/state.entity';
import { City } from '../city/entities/city.entity';
import { Domain } from '../domains/entities/domain.entity';
import { MyCategory } from '../my-categories/entities/my-category.entity';
import { Blog } from '../blogs/entities/blog.entity';
import { LandingPage } from '../landing-pages/entities/landing-page.entity';
import { CommonConfigService } from '@app/common-config/common-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      CompanySubscription,
      Roles,
      User,
      Subscription,
      CompanySetting,
      Group,
      GroupUser,
      Settings,
      Country,
      State,
      City,
      Domain,
      MyCategory,
      Blog,
      LandingPage,
    ]),
    ServicesModule,
    UtilitiesModule,
  ],
  providers: [
    CompanyService,
    CompanyScriptService,
    GeneralUtility,
    SubscriptionService,
    CommonConfigService,
  ],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
