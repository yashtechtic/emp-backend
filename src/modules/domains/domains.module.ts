import { Module } from '@nestjs/common';
import { ServicesModule } from '@app/services/services.module';
import { UtilitiesModule } from '@app/utilities/utilities.module';
import { Domain } from './entities/domain.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { DomainsService } from './domains.service';
import { DomainsController } from './domains.controller';
import { RootDomain } from './entities/root-domain.entity';

@Module({
  providers: [DomainsService],
  controllers: [DomainsController],
  imports: [
    TypeOrmModule.forFeature([Domain]),
    TypeOrmModule.forFeature([RootDomain], 'masterConnection'),
    ServicesModule,
    UtilitiesModule,
  ],
})
export class DomainsModule {}
