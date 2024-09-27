import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface IUserData {
  userId: number;
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

export interface IUserRecord {
  adminId?: number;
  roleId?: number;
}

export interface IUserAutocomplete {
  adminId: string;
  name: string;
}

export interface IUserList {
  paging: ISettingsParams;
  data: IUserData[];
}
