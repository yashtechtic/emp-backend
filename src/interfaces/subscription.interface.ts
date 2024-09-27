import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface ISubscriptionDetail {
  subscriptionId: number;
  name: string;
  code: string;
  price: number;
  rates?: string;
  overview?: string;
  featureDetails?: string;
  status: string;
  isDeleted: boolean;
}

export interface ISubscriptionList {
  paging: ISettingsParams;
  data: ISubscriptionDetail[];
}

export interface ISubscriptionAutoComplete {
  subscriptionId: number;
  name: string;
}

export interface ISubscriptionPrice {
  price: number;
  name: string;
}

export interface ISubscriptionRecord {
  subscriptionId: number;
}
