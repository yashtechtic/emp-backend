import { Status } from '@app/common-config/dto/common.dto';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface IRoleDetail {
  roleId: number;
  roleName: string;
  roleCode: string;
  capabilities: string[];
  status: Status;
}

export interface IRoleList {
  paging: ISettingsParams;
  data: IRoleDetail[];
}

export interface IRoleAutoComplete {
  roleId: number;
  roleName: string;
}

export interface IRoleRecord {
  roleId: number;
}
export interface IRoleData {
  roleId?: number;
  roleCode: string;
}

export interface ICapability {
  capabilityId: number;
  capabilityName: string;
  capabilityCode: string;
  capabilityType: string;
  capabilityMode: string;
  entityName: string;
  parentEntity: string | null;
}

export interface ICategory {
  categoryId: number;
  categoryName: string;
  categoryCode: string;
  capabilities: ICapability[];
}

export interface ICapabilities {
  capabilities: string[];
}
