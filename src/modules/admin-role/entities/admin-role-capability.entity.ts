import { Status } from '@app/common-config/dto/common.dto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('role_capability_category')
export class CapabilityCategory {
  @PrimaryGeneratedColumn({ name: 'iCapabilityCategoryId' })
  capabilityCategoryId: number;

  @Column({ name: 'vCategoryName' })
  categoryName: string;

  @Column({ name: 'vCategoryCode' })
  categoryCode: string;

  @Column({
    type: 'enum',
    enum: Status,
    name: 'eStatus',
  })
  status: Status;
}
