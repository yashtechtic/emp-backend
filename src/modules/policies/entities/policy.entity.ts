import { Status } from '@app/common-config/dto/common.dto';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('policies')
export class Policy {
  @PrimaryGeneratedColumn({ name: 'iPolicyId' })
  policyId?: number;

  @Column({ name: 'vTitle' })
  title: string;

  @Column({ name: 'vDocument', type: 'text' })
  document: string;

  @Column({ name: 'tDescription', type: 'text' })
  description: string;

  @Column({ name: 'dtStartDate', type: 'datetime', nullable: true })
  startDate: string;

  @Column({ name: 'dtEndDate', type: 'datetime', nullable: true })
  endDate: string;

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
