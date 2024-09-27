import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface IDomainDetail {
  domainId: number;
  domainUrl: string;
  rootDomainUrl: string;
  rootDomainId: number;
  domainType: string;
  status: string;
}

export interface IDomainList {
  paging: ISettingsParams;
  data: IDomainDetail[];
}

export interface IDomainAutoComplete {
  domainId: number;
  domainUrl: string;
}

export interface IDomainRecord {
  domainId: number;
}

export interface IRootDomainAutoComplete {
  rootDomainId: number;
  rootDomainUrl: string;
}
