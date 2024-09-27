import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AssessmentQuestion } from './assessment-question.entity';
import { Assessment } from './assessment.entity';

@Entity('assessment_qs_options')
export class AssessmentQuestionOption {
  @PrimaryGeneratedColumn({ name: 'iOptionId' })
  optionId?: number;

  @Column({ name: 'vOption' })
  optionData: string;

  @Column({ name: 'iAssessmentId', default: 0 })
  assessmentId?: number;

  @Column({ name: 'iAssessmentQuestionId', default: 0 })
  assessmentQuestionId?: number;

  @ManyToOne(() => Assessment, (assessment) => assessment.options, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'iAssessmentId' })
  assessment?: Assessment;

  @ManyToOne(() => AssessmentQuestion, (question) => question.options, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'iAssessmentQuestionId' })
  assessmentQuestion?: AssessmentQuestion;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;
}
