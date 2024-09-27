import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface IStateData {
  stateId: number;
  state: string;
  stateCode: string;
  countryId: number;
  country: string;
  countryCode: string;
  status: string;
}

export interface IStateList {
  paging: ISettingsParams;
  data: IStateData[];
}

export interface IStateAutoComplete {
  stateId: number;
  state: string;
}

export interface IStateRecord {
  stateId: number;
}

export interface ICountryRecord {
  countryId: number;
}
