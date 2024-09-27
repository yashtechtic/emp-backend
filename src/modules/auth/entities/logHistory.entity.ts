import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserType {
  ADMIN = 'Admin',
  FRONT = 'Front',
}

@Entity('mod_log_history')
export class LogHistory {
  @PrimaryGeneratedColumn({ name: 'iLogId' })
  logId: number;

  @Column({ name: 'iUserId' })
  userId: number;

  @Column({ name: 'vIP' })
  ip: string;

  @Column({
    type: 'enum',
    enum: UserType,
    name: 'eUserType',
  })
  userType: UserType;

  // @Column({
  //   type: 'datetime',
  //   name: 'dLoginDate',
  //   default: () => 'CURRENT_TIMESTAMP',
  // })
  // loginDate: Date;

  @CreateDateColumn({ type: 'datetime', name: 'dLoginDate' })
  loginDate: Date;

  @Column({ name: 'vCurrentUrl' })
  currentUrl: string;

  @Column({ name: 'vExtraParam' })
  extraParam: string;

  @Column({
    type: 'datetime',
    name: 'dLogoutDate',
  })
  logoutDate: Date;

  @Column({
    type: 'datetime',
    name: 'dLastAccess',
  })
  lastAccess: Date;
}
