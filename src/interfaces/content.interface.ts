import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface IContentDetail {
  contentId: number;
  title: string;
  description: string;
  contentType: string;
  status: string;
  image: string;
  imageUrl: string;
}

export interface IContentList {
  paging: ISettingsParams;
  data: IContentDetail[];
}

export interface IContentAutoComplete {
  contentId: number;
  title: string;
}

export interface IContentRecord {
  contentId: number;
}
