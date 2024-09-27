import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface INotificationTemplateDetail {
  notificationTemplateId: number;
  templateName: string;
  subject: string;
  senderEmail: string;
  senderName: string;
  content: string;
  categoryId: number;
  addedDate: string;
  modifiedDate: string;
}

export interface INotificationTemplateList {
  paging: ISettingsParams;
  data: INotificationTemplateDetail[];
}

export interface INotificationTemplateAutoComplete {
  notificationTemplateId: number;
  templateName: string;
}

export interface INotificationTemplateRecord {
  notificationTemplateId: number;
}
