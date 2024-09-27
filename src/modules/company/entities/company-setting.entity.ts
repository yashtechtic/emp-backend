import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '@app/common-config/dto/common.dto';

@Entity('company_settings')
export class CompanySetting {
  @PrimaryGeneratedColumn({ name: 'iCompanySettingId' })
  companySettingId: number;

  @Column({ name: 'iCompanyId' })
  companyId: number;

  @Column({ length: 255, name: 'vDomain' })
  domain: string;

  @Column({ length: 255, name: 'vConnectionUrl' })
  connectionUrl: string;

  @Column({ length: 255, name: 'vEmail' })
  email: string;

  @Column({ length: 255, name: 'vCompanyName' })
  companyName: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
    name: 'eStatus',
  })
  status: Status;

  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate: Date;

  @UpdateDateColumn({ name: 'dtModifiedDate' })
  modifiedDate: Date;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;
}
