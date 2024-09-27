import { ServicesModule } from '@app/services/services.module';
import { Module } from '@nestjs/common';
import { CommonConfigService } from './common-config.service';

@Module({
  imports: [ServicesModule],
  providers: [CommonConfigService],
  exports: [CommonConfigService],
})
export class CommonConfigModule {}
