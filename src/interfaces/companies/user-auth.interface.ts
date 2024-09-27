export interface IUserData {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userName: string;
  phoneNumber: string;
  otpCode: string;
  emailVerified: string;
  verificationCode: string;
  status: string;
  roleId: string;
  roleName: string;
  roleCode: string;
  roleCapabilities: string;
  groupStatus: string;
  companyId: number;
}

export interface IUserValidationData {
  name: string;
  email: string;
  emailVerified: string;
  status: string;
}

export interface IUserGroupData {
  roleCode: string;
  roleCapabilities: string;
}

export interface ICapability {
  capability: string;
}

export interface IUserPasswordData {
  userId: number;
  password: string;
}
export interface IUserRecord {
  userId: number;
}

export interface ITokenData {
  token: string;
}

export interface IEmailData {
  email: string;
  time: number;
}

export interface IUserDatabyId {
  userId: number;
  name: string;
  email: string;
}
