import { Status } from '@app/common-config/dto/common.dto';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('root_domain')
export class RootDomain {
  @PrimaryGeneratedColumn({ name: 'iRootDomainId' })
  rootDomainId?: number;

  @Column({ name: 'vRootDomainUrl' })
  rootDomainUrl: string;

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
