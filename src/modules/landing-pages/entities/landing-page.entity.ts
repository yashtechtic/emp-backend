import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '@app/common-config/dto/common.dto';

@Entity('landing_pages')
export class LandingPage {
  @PrimaryGeneratedColumn({ name: 'iLandingPageId' })
  landingPageId?: number;

  @Column({ name: 'vTitle' })
  title: string;

  @Column({ name: 'vUrl' })
  url: string;

  @Column({ name: 'iCategoryId', default: 0 })
  categoryId: number;

  @Column({ name: 'tContent', type: 'text' })
  content: string;

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

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;
}
