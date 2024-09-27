import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { Status } from '@app/common-config/dto/common.dto';

@Entity('city')
@Index('mod_city_iCountryId_index', ['countryId'])
@Index('mod_city_iStateId_index', ['stateId'])
export class City {
  @PrimaryGeneratedColumn({ name: 'iCityId' })
  cityId?: number;

  @Column({ name: 'vCity' })
  city: string;

  @Column({ name: 'vCityCode' })
  cityCode: string;

  @Column({ name: 'iCountryId', type: 'int', default: 0 })
  countryId: number;

  @Column({ name: 'iStateId', type: 'int', default: 0 })
  stateId: number;

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
