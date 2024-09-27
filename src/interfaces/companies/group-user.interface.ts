import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface IGroupDetail {
  groupId: number;
  groupName: string;
  groupCode?: string;
  groupUsers?: { userName: string; userId: number }[];
  roles?: { roleName: string; roleId: number }[];
  status?: string;
}

export interface IGroupList {
  paging: ISettingsParams;
  data: IGroupDetail[];
}

export interface IGroupAutoComplete {
  groupId: number;
  groupCode: string;
}

export interface IGroupRecord {
  countryId: number;
}
