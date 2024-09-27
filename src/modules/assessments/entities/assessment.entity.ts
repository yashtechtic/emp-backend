import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AssessmentQuestion } from './assessment-question.entity';
import { Status } from '@app/common-config/dto/common.dto';
import { AssessmentQuestionOption } from './assessment-qs-options.entity';

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn({ name: 'iAssessmentId' })
  assessmentId?: number;

  @Column({ name: 'vAssessmentTitle' })
  assessmentTitle: string;

  @Column({ name: 'iCategoryId', default: 0 })
  catgeoryId?: number;

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

  @OneToMany(
    () => AssessmentQuestion,
    (assessmentQuestion) => assessmentQuestion.assessmentId
  )
  questions?: AssessmentQuestion[];

  @OneToMany(
    () => AssessmentQuestionOption,
    (assessmentQuestionOption) => assessmentQuestionOption.assessmentId
  )
  options?: AssessmentQuestionOption[];
}
