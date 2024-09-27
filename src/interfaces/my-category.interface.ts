import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface IMyCategoryDetail {
  myCategoryId: number;
  categoryName: string;
  parentCategoryId: number;
  status: string;
}

export interface IMyCategoryList {
  paging: ISettingsParams;
  data: IMyCategoryDetail[];
}

export interface IMyCategoryAutoComplete {
  myCategoryId: number;
  categoryName: string;
}

export interface IMyCategoryRecord {
  myCategoryId: number;
}

