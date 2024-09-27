import { Status } from '@app/common-config/dto/common.dto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mod_system_email')
export class SystemEmail {
  @PrimaryGeneratedColumn({ name: 'iEmailTemplateId' })
  emailTemplateId?: number;

  @Column({ name: 'vEmailCode' })
  emailCode: string;

  @Column({ name: 'vEmailTitle' })
  emailTitle: string;

  // @Column({ name: 'vEmailHeading' })
  // emailHeading?: string;

  @Column({ name: 'vFromName' })
  fromName: string;

  @Column({ name: 'vFromEmail' })
  fromEmail: string;

  @Column({ name: 'vReplyToName' })
  replyToName: string;

  @Column({ name: 'vReplyToEmail' })
  replyToEmail: string;

  @Column({ name: 'vCcEmail' })
  ccEmail?: string;

  @Column({ name: 'vBccEmail' })
  bccEmail?: string;

  @Column({ name: 'vEmailSubject' })
  emailSubject: string;

  @Column({ name: 'tEmailMessage' })
  emailMessage: string;

  @Column({ name: 'jVarsJson' })
  variables: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
    name: 'eStatus',
  })
  status?: Status;
}
