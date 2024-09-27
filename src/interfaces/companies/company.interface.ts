import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface ICompanyRecord {
  companyId: number;
  companyName: string;
  companyEmail: string;
  companyPrefix: string;
  status: string;
  addedDate: string;
  modifiedDate: string;
  document: string;
  documentExpiryDate: string;
  isDeleted: number;
}

export interface ICompanyDetail {
  paging: ISettingsParams;
  data: ICompanyRecord[];
}
