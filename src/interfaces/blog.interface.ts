import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface IBlogDetail {
  blogId: number;
  author: number;
  title: string;
  content: string;
  publishingDate: Date;
  image?: string;
  status: string;
  estimatedReadingTime?: number;
  categoryId: number;
  categoryName: string;
}

export interface IBlogList {
  paging: ISettingsParams;
  data: IBlogDetail[];
}

export interface IBlogAutoComplete {
  blogId: number;
  title: string;
}

export interface IBlogRecord {
  blogId: number;
}
