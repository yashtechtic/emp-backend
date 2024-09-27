import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '@app/common-config/dto/common.dto';
@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn({ name: 'iSubscriptionId' })
  subscriptionId?: number;
  @Column({ name: 'vPlanName' })
  planName: string;
  @Column({ name: 'vPlanCode' })
  planCode: string;
  @Column({ name: 'dRates', type: 'float' })
  rates: string;
  @Column({ name: 'dPrice', type: 'float' })
  price: number;
  @Column({ name: 'tOverview', type: 'text', nullable: true })
  overview: string;
  @Column({ name: 'tFeatureDetails', type: 'text', nullable: true })
  featureDetails: string;
  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
    name: 'eStatus',
  })
  status: Status;
  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate?: Date;
  @UpdateDateColumn({
    name: 'dtModifiedDate',
  })
  modifiedDate?: Date;
  @Column({ name: 'iIsDefault' })
  isDefault?: number;
  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: boolean;
}
