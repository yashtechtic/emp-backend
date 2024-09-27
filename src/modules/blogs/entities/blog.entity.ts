import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '@app/common-config/dto/common.dto';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn({ name: 'iBlogId' })
  blogId?: number;

  @Column({ name: 'iUserId' })
  author: string;

  @Column({ name: 'vTitle' })
  title: string;

  @Column({ name: 'vContent' })
  content: string;

  @Column({ name: 'iCategoryId', default: 0 })
  categoryId: number;

  @Column({ name: 'dtPublishingDate', nullable: true })
  publishingDate?: Date;

  @Column({ nullable: true })
  image?: string;

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

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'dEstimatedReadingTime',
  })
  estimatedReadingTime: number;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;
}
