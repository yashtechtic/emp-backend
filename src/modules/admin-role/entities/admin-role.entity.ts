import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Status } from '@app/common-config/dto/common.dto';
@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn({ name: 'iRoleId' })
  roleId?: number;

  @Column({ name: 'vRoleName' })
  roleName?: string;

  @Column({ name: 'vRoleCode' })
  roleCode: string;

  @Column({
    type: 'text',
    name: 'tRoleCapabilities',
  })
  roleCapabilities?: string;

  @Column({
    type: 'enum',
    enum: Status,
    name: 'eStatus',
  })
  status: Status;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;
}
