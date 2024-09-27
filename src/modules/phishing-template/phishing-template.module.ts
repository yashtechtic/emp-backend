import { Module } from '@nestjs/common';
import { PhishingTemplatesController } from './phishing-template.controller';
import { PhishingTemplatesService } from './phishing-template.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { PhishingTemplate } from './entities/phishing-template.entity';

@Module({
  controllers: [PhishingTemplatesController],
  providers: [PhishingTemplatesService],
  imports: [
    TypeOrmModule.forFeature([PhishingTemplate]),
    ServicesModule,
    UtilitiesModule,
  ],
})
export class PhisingTemplateModule {}
