import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface ISystemEmailDetail {
  emailTemplateId: number;
  emailCode: string;
  emailTitle: string;
  fromName: string;
  fromEmail?: string;
  replyToName?: string;
  replyToEmail?: string;
  ccEmail?: string;
  bccEmail?: string;
  emailMessage?: string;
  emailSubject: string;
  variables?: string;
}

export interface ISystemEmailList {
  paging: ISettingsParams;
  data: ISystemEmailDetail[];
}

export interface ISystemEmailAutoComplete {
  emailTemplateId: number;
  emailTitle: string;
}

export interface ISystemEmailRecord {
  emailTemplateId: number;
}
