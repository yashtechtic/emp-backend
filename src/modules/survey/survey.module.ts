import { Module } from '@nestjs/common';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { Survey } from './entities/survey.entity';
import { SurveyQuestion } from './entities/survey-question.entity';
import { SurveyQuestionOption } from './entities/survey-qs-options.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';

@Module({
  controllers: [SurveyController],
  providers: [SurveyService],
  imports: [
    TypeOrmModule.forFeature([Survey, SurveyQuestion, SurveyQuestionOption]),
    ServicesModule,
    UtilitiesModule,
  ],
})
export class SurveyModule {}
