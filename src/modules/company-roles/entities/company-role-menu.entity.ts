// import { Status } from '@app/common-config/dto/common.dto';
// import {
//   Column,
//   Entity,
//   JoinColumn,
//   ManyToOne,
//   OneToMany,
//   PrimaryGeneratedColumn,
// } from 'typeorm';
// import { Roles } from './company-role.entity';
// import { RoleCategory } from './company-role-category.entity';

// export enum CapabilityType {
//   CUSTOM = 'Custom',
//   MODULE = 'Module',
//   DASHBOARD = 'Dashboard',
//   WIDGET = 'Widget',
//   LISTFIELD = 'ListField',
//   FORMFIELD = 'FormField',
// }

// export enum AddedBy {
//   SYSTEM = 'System',
//   MANUAL = 'Manual',
// }

// @Entity('role_menu')
// export class RoleMenu {
//   @PrimaryGeneratedColumn({ name: 'iRoleMenuId' })
//   roleMenuId: number;

//   @Column({ name: 'vMenuCode' })
//   menuCode: string;

//   @Column({ name: 'vMenuName' })
//   menuName: string;

//   @Column({ name: 'iRoleId', default: 0 })
//   roleId: number;

//   @ManyToOne(() => Roles, (role) => role.menus, {
//     createForeignKeyConstraints: false,
//   })
//   @JoinColumn({ name: 'iRoleId' })
//   role?: Roles;

//   @OneToMany(() => RoleCategory, (category) => category.roleMenuId)
//   roleCategories?: RoleCategory[];

//   @Column({
//     type: 'enum',
//     enum: AddedBy,
//     name: 'eAddedBy',
//   })
//   addedBy: AddedBy;

//   @Column({
//     type: 'enum',
//     enum: Status,
//     name: 'eStatus',
//   })
//   status: Status;
// }

import { Status } from '@app/common-config/dto/common.dto';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Roles } from './company-role.entity';
import { RoleCategory } from './company-role-category.entity';

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

@Entity('role_menu')
export class RoleMenu {
  @PrimaryGeneratedColumn({ name: 'iRoleMenuId' })
  roleMenuId: number;

  @Column({ name: 'vMenuCode' })
  menuCode: string;

  @Column({ name: 'vMenuName' })
  menuName: string;

  @Column({ name: 'iRoleId', default: 0 })
  roleId: number;

  @Column({ name: 'iOrderNumber', default: 0 })
  orderNumber: number;

  @ManyToOne(() => Roles, (role) => role.menus)
  @JoinColumn({ name: 'iRoleId' })
  role?: Roles;

  @OneToMany(() => RoleCategory, (category) => category.roleMenu)
  roleCategories?: RoleCategory[];

  @Column({
    type: 'enum',
    enum: AddedBy,
    name: 'eAddedBy',
  })
  addedBy: AddedBy;

  @Column({
    type: 'enum',
    enum: Status,
    name: 'eStatus',
  })
  status: Status;
}
