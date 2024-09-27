import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SurveyQuestion } from './survey-question.entity';
import { Status } from '@app/common-config/dto/common.dto';
import { SurveyQuestionOption } from './survey-qs-options.entity';

@Entity('survey')
export class Survey {
  @PrimaryGeneratedColumn({ name: 'iSurveyId' })
  surveyId?: number;

  @Column({ name: 'vSurveyTitle' })
  surveyTitle: string;

  @Column({ name: 'iCategoryId', default: 0 })
  categoryId?: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
    name: 'vStatus',
  })
  status: Status;

  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate?: Date;

  @UpdateDateColumn({ name: 'dtModifiedDate' })
  modifiedDate?: Date;

  @Column({ name: 'iAddedBy', default: 0 })
  addedBy?: number;

  @Column({ name: 'iUpdatedBy', default: 0 })
  updatedBy?: number;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;

  @OneToMany(() => SurveyQuestion, (surveyQuestion) => surveyQuestion.surveyId)
  questions?: SurveyQuestion[];

  @OneToMany(
    () => SurveyQuestionOption,
    (surveyQuestionOption) => surveyQuestionOption.surveyId
  )
  options?: SurveyQuestionOption[];
}
