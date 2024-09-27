import { Module } from '@nestjs/common';
import { PhisingCampignService } from './phishing-campaign.service';
import { PhisingCampignController } from './phishing-campaign.controller';

@Module({
  providers: [PhisingCampignService],
  controllers: [PhisingCampignController],
})
export class PhisingCampignModule {}
