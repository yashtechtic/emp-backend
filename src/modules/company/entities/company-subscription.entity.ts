import { Status, SubscriptionType } from '@app/common-config/dto/common.dto';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('company_subscription')
export class CompanySubscription {
  @PrimaryGeneratedColumn({ name: 'iCompanySubscriptionId' })
  companySubscriptionId: number;

  @Column({ name: 'iSubscriptionId' })
  subscriptionId: number;

  @Column({ name: 'vPlanName' })
  planName: string;

  @Column({ name: 'vPlanCode' })
  planCode: string;

  @Column({
    default: 'Pending',
    name: 'vSubscriptionStatus',
  })
  subscriptionStatus: string;

  @Column({ type: 'date', name: 'dtSubscriptionStartDate', nullable: true })
  subscriptionStartDate: Date;

  @Column({ type: 'date', name: 'dtSubscriptionExpiryDate', nullable: true })
  subscriptionExpiryDate: Date;

  @Column({ name: 'iMonthlyPlan', default: 0 })
  monthlyPlan: number;

  @Column({ name: 'iYearlyPlan', default: 0 })
  yearlyPlan: number;

  @Column({ name: 'vSubscriptionKey' })
  subscriptionKey: string;

  @Column({ name: 'iNumberOfUsers', default: 0 })
  numberOfUsers: number;

  @Column({ name: 'iNumberOfUsersInUse', default: 0 })
  numberOfUsersInUse: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
    name: 'eStatus',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: SubscriptionType,
    default: SubscriptionType.Basic,
    name: 'eType',
  })
  type: SubscriptionType;
}
