import { Status } from '@app/common-config/dto/common.dto';
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('states')
@Index('mod_state_iCountryId_index', ['countryId'])
export class State {
  @PrimaryGeneratedColumn({ name: 'iStateId' })
  stateId?: number;

  @Column({ name: 'vState' })
  state: string;

  @Column({ name: 'vStateCode' })
  stateCode: string;

  @Column({ name: 'iCountryId', default: 0 })
  countryId: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
    name: 'eStatus',
  })
  status: Status;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;
}
