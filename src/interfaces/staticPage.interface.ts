import { Status } from '@app/common-config/dto/common.dto';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface IStaticPageDetail {
  pageId: number;
  pageCode: string;
  pageTitle: string;
  content?: string;
  metaTitle?: string;
  metaKeyword?: string;
  metaDesc?: string;
  status?: Status;
}

export interface IStaticPageList {
  paging: ISettingsParams;
  data: IStaticPageDetail[];
}

export interface IStaticPageAutoComplete {
  pageId: number;
  pageTitle: string;
}

export interface IStaticPageRecord {
  pageId: number;
}
