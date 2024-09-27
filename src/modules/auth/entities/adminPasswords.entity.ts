import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Status } from '@app/common-config/dto/common.dto';

@Entity('mod_admin_passwords')
export class AdminPasswords {
  @PrimaryGeneratedColumn({ name: 'iPasswordId' })
  passwordId: number;

  @Column({ name: 'iAdminId' })
  adminId: number;

  @Column({ name: 'vPassword' })
  password: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'dtAddedDate',
  })
  addedDate?: Date;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
    name: 'eStatus',
  })
  status?: Status;
}
