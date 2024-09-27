import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Survey } from './survey.entity';
import { SurveyQuestionOption } from './survey-qs-options.entity';

@Entity('survey_question')
export class SurveyQuestion {
  @PrimaryGeneratedColumn({ name: 'iSurveyQuestionId' })
  surveyQuestionId?: number;

  @Column({ name: 'vQuestion' })
  question: string;

  @Column({ name: 'vQuestionType' })
  questionType: string;

  @Column({ name: 'iSurveyId', default: 0 })
  surveyId?: number;

  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate?: Date;

  @Column({ name: 'isDeleted', default: 0 })
  isDeleted?: number;

  @ManyToOne(() => Survey, (survey) => survey.questions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'iSurveyId' })
  survey?: Survey;

  @OneToMany(() => SurveyQuestionOption, (option) => option.surveyQuestionId)
  options?: SurveyQuestionOption[];
}
