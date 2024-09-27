import { Status } from '@app/common-config/dto/common.dto';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('domains')
export class Domain {
  @PrimaryGeneratedColumn({ name: 'iDomainId' })
  domainId?: number;

  @Column({ name: 'vDomainUrl' })
  domainUrl: string;

  @Column({ name: 'iRootDomainId', default: 0 })
  rootDomainId: number;

  @Column({ name: 'vDomainType', default: 'System' })
  domainType: string;

  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate?: Date;

  @UpdateDateColumn({ name: 'dtModifiedDate' })
  modifiedDate?: Date;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Inactive,
    name: 'eStatus',
  })
  status?: Status;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;
}
