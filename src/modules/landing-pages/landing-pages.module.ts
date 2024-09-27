import { Module } from '@nestjs/common';
import { LandingPagesController } from './landing-pages.controller';
import { LandingPagesService } from './landing-pages.service';
import { LandingPage } from './entities/landing-page.entity';
import { ServicesModule } from '@app/services/services.module';
import { UtilitiesModule } from '@app/utilities/utilities.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [LandingPagesController],
  providers: [LandingPagesService],
  imports: [
    TypeOrmModule.forFeature([LandingPage]),
    ServicesModule,
    UtilitiesModule,
  ],
})
export class LandingPagesModule {}
