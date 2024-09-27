import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface IPolicyDetail {
  policyId: number;
  title: string;
  document: string;
  description: string;
  startDate: string;
  endDate: string;
  addedDate: string;
  modifiedDate: string;
}

export interface IPolicyList {
  paging: ISettingsParams;
  data: IPolicyDetail[];
}

export interface IPolicyAutoComplete {
  policyId: number;
  title: string;
}

export interface IPolicyRecord {
  policyId: number;
}
