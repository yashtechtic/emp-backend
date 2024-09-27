import { Module } from '@nestjs/common';
import { PhisingSimulationService } from './phishing-simulation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { PhishingSimulation } from './entities/phishing-simulation.entity';
import { PhishingGroupDept } from './entities/phishing-group-dept.entity';
import { PhishingSimulationController } from './phishing-simulation.controller';

@Module({
  controllers: [PhishingSimulationController],
  providers: [PhisingSimulationService],
  imports: [
    TypeOrmModule.forFeature([PhishingSimulation, PhishingGroupDept]),
    ServicesModule,
    UtilitiesModule,
  ],
})
export class PhisingSimulationModule {}
