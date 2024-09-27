import { Module, forwardRef } from '@nestjs/common';

import { AmazonService } from './services/amazon.service';
import { EncryptService } from './services/encrypt.service';
import { FileService } from './services/file.service';
import { SettingsService } from './services/settings.service';

import { DateService } from './services/date.service';
import { MailerConfig } from './services/mailer-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailerModule } from '@nestjs-modules/mailer';
import { UtilitiesModule } from '@app/utilities';
import { Settings } from '@app/modules/settings/entities/setting.entity';
import { PhishingTemplate } from '@app/modules/phishing-template/entities/phishing-template.entity';
import { MyCategory } from '@app/modules/my-categories/entities/my-category.entity';
import { LandingPage } from '@app/modules/landing-pages/entities/landing-page.entity';
import { Domain } from '@app/modules/domains/entities/domain.entity';
import { CommonService } from './services/common-service';
import { Content } from '@app/modules/content/entities/content.entity';
import { Course } from '@app/modules/course/entities/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Settings]),
    TypeOrmModule.forFeature(
      [PhishingTemplate, MyCategory, LandingPage, Domain, Content, Course],
      'masterConnection'
    ),
    MailerModule.forRootAsync({
      useClass: MailerConfig,
      imports: [TypeOrmModule.forFeature([Settings])],
    }),
    forwardRef(() => UtilitiesModule),
  ],
  providers: [
    SettingsService,
    DateService,
    FileService,
    AmazonService,
    EncryptService,
    MailerConfig,
    CommonService,
  ],
  exports: [
    SettingsService,
    DateService,
    FileService,
    AmazonService,
    EncryptService,
    MailerConfig,
    CommonService,
  ],
})
export class ServicesModule {}
