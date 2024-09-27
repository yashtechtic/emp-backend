import { Status } from '@app/common-config/dto/common.dto';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('country')
export class Country {
  @PrimaryGeneratedColumn({ name: 'iCountryId' })
  countryId?: number;

  @Column({ name: 'vCountry' })
  country: string;

  @Column({ name: 'vCountryCode' })
  countryCode?: string;

  @Column({ name: 'vCountryCodeISO_3', nullable: true })
  countryCodeIso3: string;

  @Column({ name: 'tDescription', nullable: true })
  description: string;

  @Column({ name: 'vCountryFlag', nullable: true })
  countryFlag?: string;

  @Column({ name: 'vDialCode', nullable: true })
  dialCode?: string;

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
