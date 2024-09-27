import { Status } from '@app/common-config/dto/common.dto';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn({ name: 'iCourseId' })
  courseId?: number;

  @Column({ name: 'vCourseTitle' })
  courseTitle: string;

  @Column({ name: 'vCourseType' })
  courseType: string;

  @Column({ name: 'vDescription' })
  description: string;

  @Column({ name: 'iDuration' })
  duration: number;

  @Column({ name: 'iIsDisplayLibrary', default: 0 })
  isDisplayLibrary: number;

  @Column({ name: 'vImage' })
  image: string;

  @Column({ name: 'iCategoryId', default: 0 })
  categoryId: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
    name: 'eStatus',
  })
  status: Status;

  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate?: Date;

  @UpdateDateColumn({ name: 'dtModifiedDate' })
  modifiedDate?: Date;

  @Column({ name: 'iAddedBy' })
  addedBy?: number;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;
}
