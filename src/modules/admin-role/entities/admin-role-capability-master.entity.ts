import { Status } from '@app/common-config/dto/common.dto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum CapabilityType {
  CUSTOM = 'Custom',
  MODULE = 'Module',
  DASHBOARD = 'Dashboard',
  WIDGET = 'Widget',
  LISTFIELD = 'ListField',
  FORMFIELD = 'FormField',
}

export enum AddedBy {
  SYSTEM = 'System',
  MANUAL = 'Manual',
}

@Entity('role_capability_master')
export class CapabilityMaster {
  @PrimaryGeneratedColumn({ name: 'iCapabilityId' })
  capabilityId: number;

  @Column({ name: 'vCapabilityName' })
  capabilityName: string;

  @Column({ name: 'vCapabilityCode' })
  capabilityCode: string;

  @Column({
    type: 'enum',
    enum: CapabilityType,
    name: 'eCapabilityType',
  })
  capabilityType: CapabilityType;

  @Column({ name: 'vCapabilityMode' })
  capabilityMode: string;

  @Column({ name: 'vEntityName' })
  entityName: string;

  @Column({ name: 'vParentEntity', nullable: true })
  parentEntity: string;

  @Column({ name: 'iCategoryId' })
  category_id: number;

  @Column({
    type: 'enum',
    enum: AddedBy,
    name: 'eAddedBy',
  })
  added_by: AddedBy;

  @Column({ name: 'iOrder' })
  order: number;

  @Column({
    type: 'enum',
    enum: Status,
    name: 'eStatus',
  })
  status: Status;
}
