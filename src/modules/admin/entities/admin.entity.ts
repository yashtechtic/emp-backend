import { Status } from '@app/common-config/dto/common.dto';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AuthType {
  GOOGLE = 'Google',
  EMAIL = 'Email',
  SMS = 'SMS',
}

export enum Condition {
  Yes = 'Yes',
  No = 'No',
}

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn({ name: 'iAdminId' })
  adminId?: number;

  @Column({ name: 'vFirstName' })
  firstName: string;

  @Column({ name: 'vLastName' })
  lastName: string;

  @Column({ name: 'vUserName' })
  userName?: string;

  @Column({ name: 'vImage', nullable: true })
  image?: string;

  @Column({ unique: true, name: 'vEmail' })
  email: string;

  @Column({ nullable: true, name: 'vPassword' })
  password?: string;

  @Column({ name: 'vPhoneNumber', nullable: true })
  phoneNumber: string;

  @Column({ name: 'iRollId', default: 0 })
  roleId?: number;

  @Column({ name: 'vOTPCode', nullable: true })
  otpCode?: number;

  @Column({ name: 'eIsEmailVerified', default: Condition.No })
  isEmailVerified?: string;

  @Column({ name: 'dtOtpExpiryTime', type: 'timestamp', nullable: true })
  otpExpiryTime?: Date;

  @Column({
    type: 'date',
    name: 'dLastAccess',
    nullable: true,
  })
  lastAccess?: Date;

  @CreateDateColumn({
    name: 'dtAddedDate',
  })
  addedDate?: Date;

  @UpdateDateColumn({ name: 'dtModifiedDate' })
  modifiedDate?: Date;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
    name: 'eStatus',
  })
  status?: Status;

  @Column({ name: 'iTimeZoneId', default: 0 })
  timeZone?: number;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;

  @Column({ name: 'iCountryId', type: 'int', default: 0 })
  countryId: number;

  @Column({ name: 'iStateId', type: 'int', default: 0 })
  stateId: number;

  @Column({ name: 'vCity', type: 'varchar', nullable: true })
  city: string;

  @Column({ name: 'vAddress', type: 'varchar', nullable: true })
  address?: string;

  @Column({ name: 'vPostalCode', type: 'varchar', nullable: true })
  postalCode?: string;
}
