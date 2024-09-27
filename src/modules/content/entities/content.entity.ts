import { Status } from '@app/common-config/dto/common.dto';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('content')
export class Content {
  @PrimaryGeneratedColumn({ name: 'iContentId' })
  contentId?: number;

  @Column({ name: 'iContentTitle' })
  contentTitle: string;

  @Column({ name: 'vContentType' })
  contentType: string;

  @Column({ name: 'iCategoryId', default: 0 })
  categoryId: number;

  @Column({ name: 'vDescription', nullable: true })
  description: string;

  @Column({ name: 'iDuration' })
  duration: number;

  @Column({ name: 'iIsDisplayLibrary', default: 0 })
  isDisplayLibrary: number;

  @Column({ name: 'vImage', nullable: true })
  image: string;

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

  @Column({ name: 'iAddedBy', default: 0 })
  addedBy?: number;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;
}
