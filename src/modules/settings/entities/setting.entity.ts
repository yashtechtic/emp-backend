import { Status } from '@app/common-config/dto/common.dto';
import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum Source {
  List = 'List',
  Query = 'Query',
  Value = 'Value',
  Percent = 'Percent',
  Function = 'Function',
  NoImage = 'NoImage',
}

@Entity('mod_setting')
export class Settings {
  @PrimaryColumn({ name: 'vName' })
  name: string;

  @Column({ name: 'vDescription' })
  description: string;

  @Column({ name: 'vValue', type: 'text' })
  value: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
    name: 'eStatus',
  })
  status: Status;
}
