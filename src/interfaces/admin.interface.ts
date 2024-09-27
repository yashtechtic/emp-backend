import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface IAdminData {
  adminId: number;
  name: string;
  email: string;
  userName: string;
  dialCode: string;
  phoneNumber: string;
  roleId: number;
  roleName: string;
  roleCode: string;
  emailVerified: string;
  status: string;
  capabilities?: string[];
  addedDate?: number | null;
  modifiedDate?: number | null;
  lastAccess?: number | null;
}

export interface ICapability {
  capabilityId: number;
  capabilityName: string;
  capabilityCode: string;
  capabilityType: string;
  capabilityMode: string;
  entityName: string;
  parentEntity: string;
}

export interface IAdminRecord {
  adminId?: number;
  roleId?: number;
}

export interface IAdminAutocomplete {
  adminId: string;
  name: string;
}

export interface IAdminList {
  paging: ISettingsParams;
  data: IAdminData[];
}
