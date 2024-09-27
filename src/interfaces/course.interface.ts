import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface ICourseDetail {
  courseId: number;
  courseTitle: string;
  courseType: string;
  description: string;
  duration: number;
  isDisplayLibrary: boolean;
  image: string;
  categoryName: string;
  categoryId: number;
  status: string;
  addedDate: Date;
  modifiedDate: Date;
  addedBy: number;
}

export interface ICourseList {
  paging: ISettingsParams;
  data: ICourseDetail[];
}

export interface ICourseAutoComplete {
  courseId: number;
  courseTitle: string;
}

export interface ICourseRecord {
  courseId: number;
}
