import { Module } from '@nestjs/common';
import { MyCategoriesService } from './my-categories.service';
import { MyCategoriesController } from './my-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyCategory } from './entities/my-category.entity';
import { ServicesModule } from '@app/services/services.module';
import { UtilitiesModule } from '@app/utilities/utilities.module';

@Module({
  providers: [MyCategoriesService],
  controllers: [MyCategoriesController],
  imports: [
    TypeOrmModule.forFeature([MyCategory]),
    ServicesModule,
    UtilitiesModule,
  ],
})
export class MyCategoriesModule {}
