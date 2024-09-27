import { Status } from '@app/common-config/dto/common.dto';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notification_templates')
export class NotificationTemplate {
  @PrimaryGeneratedColumn({ name: 'iNotificationTemplateId' })
  notificationTemplateId?: number;

  @Column({ name: 'vTemplateName' })
  templateName: string;

  @Column({ name: 'vSubject' })
  subject: string;

  @Column({ name: 'vSenderEmail' })
  senderEmail: string;

  @Column({ name: 'vSenderName' })
  senderName: string;

  @Column({ name: 'tContent', type: 'text' })
  content: string;

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

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;
}
