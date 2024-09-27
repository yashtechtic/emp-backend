import { Module } from '@nestjs/common';
import { AssessmentService } from './assessments.service';
import { AssessmentController } from './assessments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { Assessment } from './entities/assessment.entity';
import { AssessmentQuestion } from './entities/assessment-question.entity';
import { AssessmentQuestionOption } from './entities/assessment-qs-options.entity';

@Module({
  providers: [AssessmentService],
  controllers: [AssessmentController],
  imports: [
    TypeOrmModule.forFeature([
      Assessment,
      AssessmentQuestion,
      AssessmentQuestionOption,
    ]),
    ServicesModule,
    UtilitiesModule,
  ],
})
export class AssessmentsModule {}
