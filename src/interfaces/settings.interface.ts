export interface IGeneralSettingsData {
  companyAddress: string;
  companyPhoneNumber: string;
  companyFacebookURL: string;
  companyInstagramURL: string;
  companyTwitterURL: string;
  companyYoutubeURL: string;
  appleStoreURL: string;
  playStoreURL: string;
  copyRightedText: string;
  panelTitle: string;
  autoRefreshTime: number;
}

export interface ISettingsData {
  fileName?: string;
  name: string;
  description: string;
  value: string;
  source: string;
  sourceValue: string;
}

export interface IFileData {
  name: string;
  url: string;
  type: string;
  width: string;
  height: string;
}

export interface ISettingsFileConfig {
  name: string;
  sourceValue: string;
}
