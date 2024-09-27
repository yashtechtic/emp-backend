import { Module } from '@nestjs/common';
import { NotificationTemplatesService } from './notification-template.service';
import { NotificationTemplatesController } from './notification-template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationTemplate } from './entities/notification-template.entity';
import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';

@Module({
  providers: [NotificationTemplatesService],
  controllers: [NotificationTemplatesController],
  imports: [
    TypeOrmModule.forFeature([NotificationTemplate]),
    ServicesModule,
    UtilitiesModule,
  ],
})
export class NotificationTemplateModule {}
