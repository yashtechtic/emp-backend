import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PhishingGroupDept } from './phishing-group-dept.entity';

@Entity('phishing_simulations')
export class PhishingSimulation {
  @PrimaryGeneratedColumn({ name: 'iPhishingSimulationId' })
  phishingSimulationId?: number;

  @Column({ name: 'vProgramName' })
  programName: string;

  @Column({ name: 'vSendTo' })
  sendTo: string;

  @Column({ name: 'vSelectType' })
  selectType: string;

  @Column({ name: 'vFrequency' })
  frequency: string;

  @Column({ name: 'dtStartDate' })
  startDate: Date;

  @Column({ name: 'tStartTime', type: 'text' })
  startTime: string;

  @Column({ name: 'iTimeZoneId', default: 0 })
  timeZoneId: number;

  @Column({ name: 'iIsSendEmail', default: 0 })
  isSendEmail: number;

  @Column({ name: 'iEmailOver', default: 0 })
  emailOver: number;

  @Column({ name: 'vEmailOverType' })
  emailOverType: string;

  @Column({ name: 'vDayStartTime', nullable: true })
  dayStartTime: string;

  @Column({ name: 'vDayEndTime', nullable: true })
  dayEndTime: string;

  @Column({ name: 'jBusinessDays', type: 'json', nullable: true })
  businessDays: any;

  @Column({ name: 'iCategoryId', default: 0 })
  categoryId: number;

  @Column({ name: 'vDifficultyRating', default: 'Low' })
  difficultyRating: string;

  @Column({ name: 'iPhishingTemplateId', default: 0 })
  phishingTemplateId: number;

  @Column({ name: 'iDomainId', default: 0 })
  domainId: number;

  @Column({ name: 'iLandingPageId', default: 0 })
  landingPageId: number;

  @Column({ name: 'iIsSendEmailReport', default: 0 })
  isSendEmailReport: number;

  @Column({ name: 'iIsHideEmailReport', default: 0 })
  isHideEmailReport: number;

  @Column({ name: 'iTrackPhishingReply', default: 0 })
  trackPhishingReply: number;

  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate?: Date;

  @UpdateDateColumn({ name: 'dtModifiedDate' })
  modifiedDate?: Date;

  @Column({ name: 'iAddedBy', default: 0 })
  addedBy: number;

  @OneToMany(() => PhishingGroupDept, (groupDept) => groupDept.selectedId)
  groupDeptIds?: PhishingGroupDept[];

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;
}
