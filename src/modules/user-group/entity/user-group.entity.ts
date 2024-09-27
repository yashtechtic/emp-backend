import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from './group.entity';

@Entity('group_users')
export class GroupUser {
  @PrimaryGeneratedColumn({ name: 'iGroupUserId' })
  groupUserId?: number;

  @Column({ name: 'iGroupId', default: 0 })
  groupId: number;

  @Column({ name: 'iUserId', default: 0 })
  userId: number;

  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate?: Date;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;

  @ManyToOne(() => Group, (group) => group.groupUser)
  @JoinColumn({ name: 'iGroupId' }) // Specify the foreign key column name here
  group: Group;
}
