import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Roles } from './company-role.entity';

@Entity('role_users')
export class RoleUser {
  @PrimaryGeneratedColumn({ name: 'iRoleUserId' })
  roleUserId?: number;

  @Column({ name: 'iRoleId' })
  roleId: number;

  @Column({ name: 'iUserId' })
  userId: number;

  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate?: Date;

  @Column({ name: 'iIsDeleted', default: 0 })
  isDeleted?: number;

  // @ManyToOne(() => Roles, (role) => role.roleUser)
  @JoinColumn({ name: 'iRoleId' }) // Specify the foreign key column name here
  role: Roles;
}
