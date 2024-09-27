import { Module } from '@nestjs/common';

import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';
import { Country } from './entities/country.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Country]),
    ServicesModule,
    UtilitiesModule,
  ],
  controllers: [CountryController],
  providers: [CountryService],
})
export class CountryModule {}
