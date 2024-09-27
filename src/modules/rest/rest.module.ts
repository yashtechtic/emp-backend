import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RestController } from './rest.controller';
import { MulterModule } from '@nestjs/platform-express';

import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { RestService } from './rest.service';
import { Settings } from '../settings/entities/setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Settings]),
    MulterModule.register(),
    ServicesModule,
    UtilitiesModule,
  ],
  controllers: [RestController],
  providers: [RestService],
})
export class RestModule {}
