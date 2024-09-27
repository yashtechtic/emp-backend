import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StateController } from './state.controller';
import { StateService } from './state.service';
import { State } from './entities/state.entity';
import { Country } from '../country/entities/country.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([State, Country]),
    ServicesModule,
    UtilitiesModule,
  ],
  controllers: [StateController],
  providers: [StateService],
})
export class StateModule {}
