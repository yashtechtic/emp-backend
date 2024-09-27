import { Status } from '@app/common-config/dto/common.dto';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'iUserId' })
  userId?: number;

  @Column({ name: 'vFirstName' })
  firstName: string;

  @Column({ name: 'vLastName' })
  lastName: string;

  @Column({ name: 'vEmail' })
  email: string;

  @Column({ name: 'vUserName' })
  userName?: string;

  @Column({ name: 'vPassword', nullable: true })
  password?: string;

  @Column({ name: 'vImage', nullable: true })
  image?: string;

  @Column({ name: 'iRollId', default: 0 })
  roleId?: number;

  @Column({ name: 'iCompanyId', default: 0 })
  companyId?: number;

  @Column({ name: 'vPhoneNumber', nullable: true })
  phoneNumber?: string;

  @Column({ name: 'vOtpCode', nullable: true })
  otpCode?: number;

  @Column({ name: 'dtOtpExpiryTime', nullable: true })
  otpExpiryTime?: Date;

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

  @Column({ name: 'iTimeZoneId', type: 'int', nullable: true })
  timeZone?: number;

  @Column({ name: 'iDepartMentId', type: 'int', nullable: true })
  departmentId?: number;

  @Column({ name: 'iParentUserId', type: 'int', nullable: true })
  parentUserId?: number;

  @Column({ name: 'eIsEmailVerified', nullable: true })
  isEmailVerified?: string;

  @Column({ name: 'iCountryId', type: 'int', default: 0 })
  countryId: number;

  @Column({ name: 'iStateId', type: 'int', default: 0 })
  stateId: number;

  @Column({ name: 'vCity', type: 'varchar' })
  city: string;

  @Column({ name: 'vAddress', type: 'varchar' })
  address?: string;

  @Column({ name: 'vPostalCode', type: 'varchar', nullable: true })
  postalCode?: string;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;
}
