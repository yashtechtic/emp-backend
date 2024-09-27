import { Condition, Status } from '@app/common-config/dto/common.dto';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

export interface ICustomerData {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  dialCode: string;
  phoneNumber: string;
  profileImage: string;
  profileImageName?: string;
  isEmailVerified: Condition;
  status: Status;
}

export interface ICustomerLogin extends ICustomerData {
  logId: number;
  accessToken: string;
}

export interface ICustomerRecord {
  customerId?: number;
}

export interface ICustomerAutocomplete {
  customerId: string;
  fullName: string;
}

export interface ICustomerList {
  paging: ISettingsParams;
  data: ICustomerData[];
}

export interface ICustomerImage {
  customerId: number;
  profileImage: string;
}

export interface ICustomerPayload {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: Condition;
  status: Status;
  logId: number;
}

export interface ICustomerByVerifyCode {
  customerId: number;
  emailVerified: Condition;
}

export interface ICustomerFetch {
  customerId: number;
  password: string;
  email: string;
  fullName: string;
}

export interface ICustomerInfoWithResetCode extends ICustomerFetch {
  resetOtpCode: number;
}

export interface ICustomerPassword {
  password: string;
}

export interface ICustomerInfo {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
}
