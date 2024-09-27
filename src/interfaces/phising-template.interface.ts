import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface IPhishingTemplateDetail {
  phishingTemplateId: number;
  templateName: string;
  senderEmail: string;
  senderName: string;
  replyToName?: string;
  replyToEmail?: string;
  subject: string;
  file?: string;
  fileType?: string;
  landingPageId: number;
  domainId: number;
  difficultyRating?: string;
  status: string;
  addedDate?: Date;
  modifiedDate?: Date;
  isDeleted?: number;
  isEditingOption?: number;
  addedBy: number;
  updatedBy: number;
  categoryId: number;
  fileContent: string;
  isSystemDomain: number;
  isSystemLandingPage: number;
  domainUrl: string;
  title: string;
  category: string;
}

export interface IPhishingTemplateList {
  paging: ISettingsParams;
  data: IPhishingTemplateDetail[];
}

export interface IPhishingTemplateAutoComplete {
  phishingTemplateId: number;
  templateName: string;
}

export interface IPhishingTemplateRecord {
  phishingTemplateId: number;
}
