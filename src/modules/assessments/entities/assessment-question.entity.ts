import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Assessment } from './assessment.entity';
import { AssessmentQuestionOption } from './assessment-qs-options.entity';

@Entity('assessment_question')
export class AssessmentQuestion {
  @PrimaryGeneratedColumn({ name: 'iAssessmentQuestionId' })
  assessmentQuestionId?: number;

  @Column({ name: 'vQuestion' })
  question: string;

  @Column({ name: 'vQuestionType' })
  questionType: string;

  @Column({ name: 'vCorrectAnswer' })
  correctAnswer: string;

  @Column({ name: 'isDeleted', default: 0 })
  isDeleted?: number;

  @Column({ name: 'iAssessmentId', default: 0 })
  assessmentId?: number;

  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate?: Date;

  @ManyToOne(() => Assessment, (assessment) => assessment.questions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'iAssessmentId' })
  assessment?: Assessment;

  @OneToMany(
    () => AssessmentQuestionOption,
    (option) => option.assessmentQuestionId
  )
  options?: AssessmentQuestionOption[];
}
