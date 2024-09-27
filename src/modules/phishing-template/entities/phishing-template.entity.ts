import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '@app/common-config/dto/common.dto';

@Entity('phishing_templates')
export class PhishingTemplate {
  @PrimaryGeneratedColumn({ name: 'iPhishingTemplateId' })
  phishingTemplateId?: number;

  @Column({ name: 'vTemplateName' })
  templateName: string;

  @Column({ name: 'vSenderEmail' })
  senderEmail: string;

  @Column({ name: 'vSenderName', nullable: true })
  senderName: string;

  @Column({ name: 'vReplyToName', nullable: true })
  replyToName: string;

  @Column({ name: 'vReplyToEmail', nullable: true })
  replyToEmail: string;

  @Column({ name: 'vSubject' })
  subject: string;

  @Column({ name: 'vFile', nullable: true })
  file: string;

  @Column({ name: 'vFileType', nullable: true })
  fileType: string;

  @Column({ name: 'iLandingPageId', default: 0 })
  landingPageId: number;

  @Column({ name: 'iDomainId', default: 0 })
  domainId: number;

  @Column({ name: 'dDifficultyRating', default: 0.0 })
  difficultyRating: number;

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

  @Column({ name: 'iIsEditingOption', default: 0 })
  isEditingOption?: number;

  @Column({ name: 'iAddedBy', default: 0 })
  addedBy: number;

  @Column({ name: 'iUpdatedBy', default: 0 })
  updatedBy: number;

  @Column({ name: 'iCategoryId', default: 0 })
  categoryId: number;

  @Column({ name: 'tFileContent', type: 'text', nullable: true })
  fileContent: string;

  @Column({ name: 'iIsSystemDomain', default: 1 })
  isSystemDomain: number;

  @Column({ name: 'iIsSystemLandingPage', default: 1 })
  isSystemLandingPage: number;
}
