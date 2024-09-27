import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface ISmsTemplateDetail {
  smsTemplateId: number;
  templateCode: string;
  templateTitle: string;
  message?: string;
  variables?: string;
}

export interface ISmsTemplateList {
  paging: ISettingsParams;
  data: ISmsTemplateDetail[];
}

export interface ISmsTemplateAutoComplete {
  smsTemplateId: number;
  templateTitle: string;
}

export interface ISmsTemplateRecord {
  smsTemplateId: number;
}
