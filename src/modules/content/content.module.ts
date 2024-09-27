import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { Content } from './entities/content.entity';
import { CommonConfigModule } from '@app/common-config/common-config.module';

@Module({
  providers: [ContentService],
  controllers: [ContentController],
  imports: [
    TypeOrmModule.forFeature([Content]),
    ServicesModule,
    UtilitiesModule,
    CommonConfigModule,
  ],
})
export class ContentModule {}
