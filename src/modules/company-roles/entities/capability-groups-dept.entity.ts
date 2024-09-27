import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { RoleCategory } from './company-role-category.entity';

@Entity('capability_groups_departments')
export class CapabilityGroupsDepartments {
  @PrimaryGeneratedColumn({ name: 'iCapabilityGroupDepartmentId' })
  capabilityGroupDepartmentId: number;

  @Column({ name: 'iRoleCategoryId', default: 0 })
  roleCategoryId: number;

  @Column({ name: 'iGroupId', default: 0 })
  groupId: number;

  @Column({ name: 'iDepartmentId', default: 0 })
  departmentId: number;

  @Column({ name: 'iRoleId', default: 0 })
  roleId: number;

  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate?: Date;

  @ManyToOne(() => RoleCategory)
  @JoinColumn({ name: 'iRoleCategoryId' })
  roleCategory: RoleCategory;
}
