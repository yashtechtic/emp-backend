import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface ICityData {
  cityId: number;
  city: string;
  cityCode: string;
  status: string;
  countryId: number;
  country: string;
  stateId: number;
  state: string;
}

export interface ICityList {
  paging: ISettingsParams;
  data: ICityData[];
}

export interface ICityAutoComplete {
  cityId: number;
  city: string;
}

export interface ICityRecord {
  cityId: number;
}
