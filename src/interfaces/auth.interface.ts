export interface IAdminData {
  adminId: number;
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
  roleStatus: string;
}

export interface IMenuItem {
  adminMenuId: number;
  title: string;
  icon: string;
  permission: string;
  id: string;
  collapsed: boolean;
  subMenu: IMenuItem[];
  openIn?: string;
  routerLink?: string;
  isChildItem?: boolean;
}

export interface IAdminValidationData {
  name: string;
  email: string;
  emailVerified: string;
  status: string;
}

export interface IAdminGroupData {
  roleCode: string;
  roleCapabilities: string;
}

export interface ICapability {
  capability: string;
}

export interface IAdminPasswordData {
  adminId: number;
  password: string;
}
export interface IAdminRecord {
  adminId: number;
}

export interface ITokenData {
  token: string;
}

export interface IEmailData {
  email: string;
  time: number;
}

export interface IAdminDatabyId {
  adminId: number;
  name: string;
  email: string;
}
