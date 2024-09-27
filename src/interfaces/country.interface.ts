import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface ICountryDetail {
  countryId: number;
  country: string;
  countryCode: string;
  countryCodeIso3: string;
  dialCode: string;
  description?: string;
  status: string;
}

export interface ICountryList {
  paging: ISettingsParams;
  data: ICountryDetail[];
}

export interface ICountryAutoComplete {
  countryId: number;
  country: string;
}

export interface ICountryDialCode {
  dialCode: string;
  country: string;
}

export interface ICountryRecord {
  countryId: number;
}
