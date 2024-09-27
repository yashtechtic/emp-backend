import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SurveyQuestion } from './survey-question.entity';
import { Survey } from './survey.entity';

@Entity('survey_qs_options')
export class SurveyQuestionOption {
  @PrimaryGeneratedColumn({ name: 'iOptionId' })
  optionId?: number;

  @Column({ name: 'vOption' })
  optionData: string;

  @Column({ name: 'iSurveyId', default: 0 })
  surveyId?: number;

  @Column({ name: 'iSurveyQuestionId', default: 0 })
  surveyQuestionId?: number;

  @ManyToOne(() => Survey, (survey) => survey.options, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'iSurveyId' })
  survey?: Survey;

  @ManyToOne(() => SurveyQuestion, (question) => question.options, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'iSurveyQuestionId' })
  surveyQuestion?: SurveyQuestion;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;
}
