export enum ACTIONS {
  ADDED = 'ADDED',
  NOT_ADDED = 'NOT_ADDED',
  UPDATED = 'UPDATED',
  NOT_UPDATED = 'NOT_UPDATED',
  CHANGE_STATUS = 'CHANGE_STATUS',
  STATUS_NOT_CHANGE = 'STATUS_NOT_CHANGE',
  DELETED = 'DELETED',
  NOT_DELETED = 'NOT_DELETED',
  DETAIL_FOUND = 'DETAIL_FOUND',
  DETAIL_NOT_FOUND = 'DETAIL_NOT_FOUND',
  LIST_FOUND = 'LIST_FOUND',
  LIST_NOT_FOUND = 'LIST_NOT_FOUND',
  LOGIN = 'LOGIN',
  NO_AUTH_TOKEN = 'NO_AUTH_TOKEN',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  JWT_MALFORMED = 'JWT_MALFORMED',
  JWT_EXPIRED = 'JWT_EXPIRED',
  CODE_EXIST = 'CODE_EXIST',
  NOT_EXIST = 'NOT_EXIST',
  EMAIL_EXIST = 'EMAIL_EXIST',
  EMAIL_AVAILABLE = 'EMAIL_AVAILABLE',
  ADMIN_CANT_DELETED = 'ADMIN_CANT_DELETED',
  STATUS_GRP_CH_NOT_ALLOWED = 'STATUS_GRP_CH_NOT_ALLOWED',
  DEFAULT_MESSAGE = 'DEFAULT_MESSAGE',
  EMAIL_ENTRY = 'EMAIL_ENTRY',
  ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',
  ACCOUNT_NOT_ACTIVE = 'ACCOUNT_NOT_ACTIVE',
  USER_EMAIL_EXIST = 'USER_EMAIL_EXIST',
  NO_MENU = 'NO_MENU',
  MENU_FOUND = 'MENU_FOUND',
  CAPS_NOT_FOUND = 'CAPS_NOT_FOUND',
  CAPS_FOUND = 'CAPS_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  OTP_SENT = 'OTP_SENT',
  VERIFICATION_LINK_EXPIRED = 'VERIFICATION_LINK_EXPIRED',
  ACCOUNT_ACTIVATED = 'ACCOUNT_ACTIVATED',
  TOKEN_VALID = 'TOKEN_VALID',
  OTP_MISMATCH = 'OTP_MISMATCH',
  INVALID_TOKEN = 'INVALID_TOKEN',
  INVALID_VERIFY_TOKEN = 'INVALID_VERIFY_TOKEN',
  PASSWORD_UPDATED = 'PASSWORD_UPDATED',
  ALREADY_USED_PASSWORD = 'ALREADY_USED_PASSWORD',
  OLD_PASSWORD_MISMATCH = 'OLD_PASSWORD_MISMATCH',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  INVALID_CREDENTIAL = 'INVALID_CREDENTIAL',
  TEMPORARILY_INACTIVATED = 'TEMPORARILY_INACTIVATED',
  PASSWORD_NOT_CREATED = 'PASSWORD_NOT_CREATED',

  CAPS_LIST = 'CAPS_LIST',
  CAPS_NO_LIST = 'CAPS_NO_LIST',
  GEN_SETTINGS = 'GEN_SETTINGS',
  FILE_UPLOADED = 'FILE_UPLOADED',
  NOT_UPLOAD = 'NOT_UPLOAD',
  AUTOCOMPLETE = 'AUTOCOMPLETE',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  RESET_PASSWORD = 'RESET_PASSWORD',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  EMAIL_VERIFY_SEND = 'EMAIL_VERIFY_SEND',
  LOGOUT = 'LOGOUT',
  PASSWORD_RESET_SENT = 'PASSWORD_RESET_SENT',
  USER_NOT_EXIST = 'USER_NOT_EXIST',
  FILE_NOT_PROVIDED = 'FILE_NOT_PROVIDED',
  GROUP_EXIST = 'GROUP_EXIST',
}
