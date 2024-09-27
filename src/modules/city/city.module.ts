import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CityController } from './city.controller';
import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { CityService } from './city.service';
import { City } from './entities/city.entity';
import { State } from '../state/entities/state.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([City, State]),
    ServicesModule,
    UtilitiesModule,
  ],
  controllers: [CityController],
  providers: [CityService],
})
export class CityModule {}
