import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '@app/common-config/dto/common.dto';
import { GroupUser } from './user-group.entity';
import { GroupToRole } from './group-role-association.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn({ name: 'iGroupId' })
  groupId?: number;

  @Column({ name: 'vGroupName' })
  groupName: string;

  @Column({ name: 'iIsNormalGroup', default: 1 })
  isNormalGroup: boolean;

  @Column({ name: 'vGroupCode' })
  groupCode: string;

  @Column({ name: 'iFormId', nullable: true })
  formId: number;

  @Column({
    type: 'enum',
    enum: Status,
    name: 'eStatus',
    default: Status.Active,
  })
  status: Status;

  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate?: Date;

  @UpdateDateColumn({
    name: 'dtModifiedDate',
  })
  modifiedDate?: Date;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;

  @OneToMany(() => GroupUser, (groupUser) => groupUser.groupId)
  groupUser?: GroupUser[];

  @OneToMany(() => GroupToRole, (role) => role.roleId)
  roles?: GroupToRole[];

  @Column({ name: 'jFormContent', type: 'json', nullable: true })
  formContent?: any;
}
