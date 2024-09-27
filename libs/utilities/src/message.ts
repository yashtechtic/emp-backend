import { ACTIONS } from './action';

type ActionMap = {
  [key in ACTIONS]: (moduleName?: string) => string;
};

export const MESSAGE: ActionMap = {
  ADDED: (moduleName) => `${moduleName} added successfully`,
  NOT_ADDED: (moduleName) =>
    `Error occurred while adding the new ${moduleName}`,
  UPDATED: (moduleName) => `${moduleName} updated successfully`,
  NOT_UPDATED: (moduleName) =>
    `Error occurred while updating the ${moduleName}`,
  CHANGE_STATUS: () => `Status change successfully`,
  STATUS_NOT_CHANGE: () => `Error occurred while updating the status`,
  LIST_FOUND: () => `Data found successfully`,
  LIST_NOT_FOUND: () => `Data not found`,
  DETAIL_FOUND: (moduleName) => `${moduleName} details found successfully`,
  DETAIL_NOT_FOUND: (moduleName) => `${moduleName} details not found`,
  DELETED: (moduleName) => `${moduleName} deleted successfully`,
  NOT_DELETED: (moduleName) =>
    `Error occurred while deleting the ${moduleName}`,
  NO_AUTH_TOKEN: () => 'Token not found.',
  INVALID_SIGNATURE: () => 'Authentication key not found.',
  JWT_MALFORMED: () => 'Token not found.',
  INVALID_TOKEN: () => 'Token not found.',
  INVALID_VERIFY_TOKEN: () => 'Invalid verification token. Please try again.',
  JWT_EXPIRED: () => 'Authentication key has been expired.',
  LOGIN: (moduleName) =>
    `Welcome ${moduleName}, you have successfully logged in.`,
  CODE_EXIST: (moduleName) => `${moduleName} code already exist.`,
  EMAIL_EXIST: (moduleName) => `${moduleName} email already exist.`,
  EMAIL_AVAILABLE: (moduleName) => `${moduleName} email available.`,
  NOT_EXIST: (moduleName) => `${moduleName} does not exists.`,
  ADMIN_CANT_DELETED: () => 'You can not delete this particular admin.',
  STATUS_GRP_CH_NOT_ALLOWED: (moduleName) =>
    `You can not change status / group for this particular ${moduleName}.`,
  DEFAULT_MESSAGE: () => 'Something went wrong.Please try again.',
  CAPS_LIST: () => 'Capabilities list found.',
  CAPS_NO_LIST: () => 'Capabilities list not found.',
  GEN_SETTINGS: () => 'General settings found successfully.',
  FILE_UPLOADED: () => 'File uploaded successfully.',
  NOT_UPLOAD: () => 'File upload failed. Please try again.',

  AUTOCOMPLETE: (moduleName) => `${moduleName} autocomplete message here`,
  FORGOT_PASSWORD: (moduleName) => `${moduleName} forgot password message here`,
  CHANGE_PASSWORD: (moduleName) => `${moduleName} change password message here`,
  RESET_PASSWORD: (moduleName) => `${moduleName} reset password message here`,
  INVALID_CREDENTIAL: () =>
    'Sorry! Invalid credentials. Please enter valid credentials.',
  TEMPORARILY_INACTIVATED: () =>
    'Your admin login temporarily inactivated. Please contact administrator..!',
  PASSWORD_NOT_CREATED: () =>
    'Your password has not been created. Please reset it',

  EMAIL_ENTRY: () => 'Enter the registered email address.',
  ACCOUNT_NOT_VERIFIED: () => 'Your account is not verified.',
  ACCOUNT_NOT_ACTIVE: () =>
    'Your account is not active. Please contact administrator.',
  USER_EMAIL_EXIST: () => 'Your email is exist.',
  NO_MENU: () => 'No  menu found.',
  MENU_FOUND: () => 'Menu found.',
  CAPS_NOT_FOUND: () => 'Capabilities not found',
  CAPS_FOUND: (moduleName) => `${moduleName} capabilities found successfully.`,
  USER_NOT_FOUND: (moduleName) =>
    `No ${moduleName} exists with this email address.`,
  OTP_SENT: () => 'OTP sent successfully.',
  VERIFICATION_LINK_EXPIRED: () => 'Verification link is expired.',
  ACCOUNT_ACTIVATED: () => 'Your account is already activated.',
  TOKEN_VALID: () => 'Token is not expired.',
  OTP_MISMATCH: () => 'Sorry! #otp_code# does not matched.',
  PASSWORD_UPDATED: () =>
    'Password updated successfully, Please login to continue.',
  ALREADY_USED_PASSWORD: () =>
    'You have already used this password, Please enter different password.',
  OLD_PASSWORD_MISMATCH: () => 'Old password does not matched.',
  PASSWORD_CHANGED: () => 'Password changed successfully.',
  EMAIL_VERIFIED: () => 'Email verified successfully.',
  EMAIL_VERIFY_SEND: () => 'Email verification link is send to your email',
  PASSWORD_RESET_SENT: () =>
    'We have send an email to reset your password. Please check and follow the instructions',
  LOGOUT: () => 'Logout successfully.',
  USER_NOT_EXIST: (moduleName) => `No ${moduleName} exist.`,
  FILE_NOT_PROVIDED: () => `File not provided`,
  GROUP_EXIST: (moduleName) => `${moduleName} group already exist.`,
};
