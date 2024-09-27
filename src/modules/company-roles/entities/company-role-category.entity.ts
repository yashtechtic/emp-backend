// import { Status } from '@app/common-config/dto/common.dto';
// import {
//   Column,
//   CreateDateColumn,
//   Entity,
//   JoinColumn,
//   ManyToOne,
//   OneToMany,
//   PrimaryGeneratedColumn,
// } from 'typeorm';
// import { RoleMenu } from './company-role-menu.entity';
// import { CapabilityGroupsDepartments } from './capability-groups-dept.entity';

// @Entity('role_category')
// export class RoleCategory {
//   @PrimaryGeneratedColumn({ name: 'iRoleCategoryId' })
//   capabilityCategoryId: number;

//   @Column({ name: 'vCategoryName' })
//   categoryName: string;

//   @Column({ name: 'vCategoryCode' })
//   categoryCode: string;

//   @Column({ name: 'vCategoryCapability' })
//   categoryCapability: string;

//   @Column({ name: 'iRoleMenuId', default: 0 })
//   roleMenuId: number;

//   @ManyToOne(() => RoleMenu, (roleMenu) => roleMenu.roleCategories, {
//     createForeignKeyConstraints: false,
//   })
//   @JoinColumn({ name: 'iRoleMenuId' })
//   roleMenu?: RoleMenu;

//   @OneToMany(
//     () => CapabilityGroupsDepartments,
//     (groupDept) => groupDept.roleCategoryId
//   )
//   groupDept?: CapabilityGroupsDepartments[];

//   @Column({
//     type: 'enum',
//     enum: Status,
//     name: 'eStatus',
//   })
//   status: Status;

//   @CreateDateColumn({ name: 'dtAddedDate' })
//   addedDate?: Date;
// }

import { Status } from '@app/common-config/dto/common.dto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleMenu } from './company-role-menu.entity';
import { CapabilityGroupsDepartments } from './capability-groups-dept.entity';

@Entity('role_category')
export class RoleCategory {
  @PrimaryGeneratedColumn({ name: 'iRoleCategoryId' })
  capabilityCategoryId: number;

  @Column({ name: 'vCategoryName' })
  categoryName: string;

  @Column({ name: 'vCategoryCode' })
  categoryCode: string;

  @Column({ name: 'vCategoryCapability' })
  categoryCapability: string;

  @Column({ name: 'vPossibleCapability' })
  possibleCapability: string;

  @Column({ name: 'iRoleMenuId', default: 0 })
  roleMenuId: number;

  @Column({ name: 'iOrderNumber', default: 0 })
  orderNumber: number;

  @ManyToOne(() => RoleMenu, (roleMenu) => roleMenu.roleCategories)
  @JoinColumn({ name: 'iRoleMenuId' })
  roleMenu?: RoleMenu;

  @OneToMany(
    () => CapabilityGroupsDepartments,
    (groupDept) => groupDept.roleCategory
  )
  groupDept?: CapabilityGroupsDepartments[];

  @Column({
    type: 'enum',
    enum: Status,
    name: 'eStatus',
  })
  status: Status;

  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate?: Date;
}
