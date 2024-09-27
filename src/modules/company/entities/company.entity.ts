import { Status } from '@app/common-config/dto/common.dto';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('company')
export class Company {
  @PrimaryGeneratedColumn({ name: 'iCompanyId' })
  companyId: number;

  @Column({ name: 'vCompanyName' })
  companyName: string;

  @Column({ name: 'vCompanyEmail' })
  companyEmail: string;

  @Column({ name: 'vLogo', nullable:true })
  logo: string;

  @Column({ name: 'vDialCode' , nullable:true })
  dialCode: string;

  @Column({ name: 'vCompanyPrefix' })
  companyPrefix: string;

  @Column({ name: 'iUserId', default: 1 })
  userId?: number;

  @Column({ name: 'iCountryId', type: 'int', default: 0 })
  countryId: number;

  @Column({ name: 'iStateId', type: 'int', default: 0 })
  stateId: number;

  @Column({ name: 'vCity', type: 'varchar' })
  city: string;

  @Column({ name: 'vAddress', type: 'varchar' })
  address?: string;

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

  @Column({ type: 'text', nullable: true, name: 'vDocument' })
  document: string;

  @Column({ type: 'date', nullable: true, name: 'dtDocumentExpiryDate' })
  documentExpiryDate: Date;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;
}
