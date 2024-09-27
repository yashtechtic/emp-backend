import { Roles } from '@app/modules/company-roles/entities/company-role.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Group } from './group.entity';

@Entity('GroupToRole')
export class GroupToRole {
  @PrimaryGeneratedColumn({ name: 'iRoleGroupId' })
  roleGroupId: number;

  @Column({ name: 'iRoleId', default: 0 })
  roleId: number;

  @Column({ name: 'iGroupId', default: 0 })
  groupId: number;

  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate?: Date;

  @ManyToOne(() => Roles, (role) => role.groups)
  @JoinColumn({ name: 'iRoleId' })
  role: Roles;

  @ManyToOne(() => Group, (group) => group.roles)
  @JoinColumn({ name: 'iGroupId' })
  group: Group;
}
