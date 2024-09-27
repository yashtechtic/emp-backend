import { Status } from '@app/common-config/dto/common.dto';
import { GroupToRole } from '@app/modules/user-group/entity/group-role-association.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RoleMenu } from './company-role-menu.entity';

@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn({ name: 'iRoleId' })
  roleId?: number;

  @Column({ name: 'vRoleCode' })
  roleCode: string;

  @Column({ name: 'vRoleName' })
  roleName: string;

  @Column({
    type: 'enum',
    enum: Status,
    name: 'eStatus',
    default: Status.Active,
  })
  status?: Status;

  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate?: Date;

  @UpdateDateColumn({
    name: 'dtModifiedDate',
  })
  modifiedDate?: Date;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;

  @OneToMany(() => GroupToRole, (groupToRole) => groupToRole.role)
  groups?: GroupToRole[];

  // @OneToMany(() => RoleCapabilities, (roleCapability) => roleCapability.role)
  // roleCapability?: RoleCapabilities[];
  @OneToMany(() => RoleMenu, (roleMenu) => roleMenu.roleId)
  menus?: RoleMenu[];
}
