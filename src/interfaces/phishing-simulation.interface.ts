import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface IPhishingSimulationDetail {
  phishingSimulationId: number;
  programName: string;
  sendTo: string;
  selectType: string;
  frequency: string;
  startDate: Date;
  startTime: string;
  timeZoneId: number;
  isSendEmail: number;
  emailOver: number;
  emailOverType: string;
  dayStartTime?: string;
  dayEndTime?: string;
  categoryId: number;
  categoryName: string;
  difficultyRating: string;
  phishingTemplateId: number;
  templateName: string;
  domainId: number;
  domainUrl: string;
  landingPageId: number;
  title: string;
  isSendEmailReport: number;
  isHideEmailReport: number;
  trackPhishingReply: number;
  addedDate?: Date;
  modifiedDate?: Date;
  addedBy: number;
  isDeleted?: number;
  groupDeptIds?: { key: number; value: string }[];
}

export interface IPhishingSimulationList {
  paging: ISettingsParams;
  data: IPhishingSimulationDetail[];
}

export interface IPhishingSimulationAutoComplete {
  phishingSimulationId: number;
  programName: string;
}

export interface IPhishingSimulationRecord {
  phishingSimulationId: number;
}
