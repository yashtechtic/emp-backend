import { HttpStatus } from '@nestjs/common';

export enum SUCCESS {
  true = 1,
  false = 0,
}

export interface ISettingsParams {
  status: HttpStatus;
  success: SUCCESS;
  message: string;
  access_token?: string;
  count?: number;
  offset?: number;
  per_page?: number;
  curr_page?: number;
  last_page?: number;
  prev_page?: boolean;
  next_page?: boolean;
}

export interface IApiResponse<T = unknown> {
  settings: ISettingsParams;
  data: T[];
  results?: any;
}

export interface IResponseTemplate {
  settings: {
    success: SUCCESS;
    message: string;
    status: HttpStatus;
    access_token?: string;
    count?: number;
    offset?: number;
    per_page?: number;
    curr_page?: number;
    prev_page?: boolean;
    next_page?: boolean;
  };
  data: any;
}

export interface RedisInterface {
  USER: string;
  PASS: string;
  HOST: string;
  PORT: string;
  DB?: string;
}
