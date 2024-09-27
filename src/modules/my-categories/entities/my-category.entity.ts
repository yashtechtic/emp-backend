import { Status } from '@app/common-config/dto/common.dto';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('my_categories')
export class MyCategory {
  @PrimaryGeneratedColumn({ name: 'iMyCategoryId' })
  myCategoryId?: number;

  @Column({ name: 'vCategoryName' })
  categoryName: string;

  @Column({ name: 'vCategoryType' })
  categoryType: string;

  @Column({ name: 'iParentCategoryId', default: 0 })
  parentCategoryId?: number;

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
