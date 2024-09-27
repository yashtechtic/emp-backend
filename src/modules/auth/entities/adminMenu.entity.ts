import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Status } from '@app/common-config/dto/common.dto';
export enum Open {
  SAME = 'Same',
  NEW = 'New',
  POPUP_IFRAME = 'popup_iframe',
  POPUP_AJAX = 'popup_ajax',
}

export enum ModuleType {
  CUSTOM = 'custom',
  MODULE = 'module',
  DASHBOARD = 'dashboard',
}
@Entity('mod_admin_menu')
export class AdminMenu {
  @PrimaryGeneratedColumn({ name: 'iAdminMenuId' })
  adminMenuId: number;

  @Column({ name: 'iParentId' })
  parentId: number;

  @Column({ name: 'vMenuDisplay' })
  menuDisplay: string;

  @Column({ name: 'vIcon' })
  icon: string;

  @Column({ name: 'vURL' })
  url: string;

  @Column({
    type: 'enum',
    enum: Open,
    name: 'eOpen',
  })
  open: Open;

  @Column({
    type: 'enum',
    enum: ModuleType,
    name: 'eMenuType',
  })
  menuType: ModuleType;

  @Column({ name: 'iCapabilityId' })
  capabilityId: number;

  @Column({ name: 'vCapabilityCode' })
  capabilityCode: string;

  @Column({ name: 'vModuleName' })
  moduleName: string;

  @Column({ name: 'vDashBoardPage' })
  dashBoardPage: string;

  @Column({ name: 'vUniqueMenuCode' })
  uniqueMenuCode: string;

  @Column({ name: 'iColumnNumber' })
  columnNumber: number;

  @Column({ name: 'iSequenceNumber' })
  sequenceNumber: number;

  @Column({
    type: 'enum',
    enum: Status,
    name: 'eStatus',
  })
  status: Status;
}
