import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface ILandingPageDetail {
  landingPageId: number;
  title: string;
  content: string;
  status: string;
  categoryId: number;
  categoryName: string;
  addedDate: string;
  modifiedDate: string;
}

export interface ILandingPageList {
  paging: ISettingsParams;
  data: ILandingPageDetail[];
}

export interface ILandingPageAutoComplete {
  landingPageId: number;
  title: string;
}

export interface ILandingPageRecord {
  landingPageId: number;
}
