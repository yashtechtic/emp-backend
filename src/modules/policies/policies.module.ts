import { Module } from '@nestjs/common';
import { PoliciesController } from './policies.controller';
import { PoliciesService } from './policies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Policy } from './entities/policy.entity';
import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { CommonConfigModule } from '@app/common-config';

@Module({
  controllers: [PoliciesController],
  providers: [PoliciesService],
  imports: [
    TypeOrmModule.forFeature([Policy]),
    ServicesModule,
    CommonConfigModule,
    UtilitiesModule,
  ],
})
export class PoliciesModule {}
