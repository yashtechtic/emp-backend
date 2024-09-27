import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Course } from './entities/course.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { CommonConfigModule } from '@app/common-config';

@Module({
  controllers: [CourseController],
  providers: [CourseService],
  imports: [
    TypeOrmModule.forFeature([Course]),
    ServicesModule,
    UtilitiesModule,
    CommonConfigModule,
  ],
})
export class CourseModule {}
