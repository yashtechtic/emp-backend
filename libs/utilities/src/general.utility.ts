import { DateService } from '@app/services/services/date.service';
import { EncryptService } from '@app/services/services/encrypt.service';
import { SettingsService } from '@app/services/services/settings.service';
import { Inject, forwardRef } from '@nestjs/common';
import { Base64 } from 'js-base64';
import _ from 'underscore';
import * as randomize from 'randomatic';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';

export class GeneralUtility {
  constructor(
    @Inject(forwardRef(() => SettingsService))
    private settings: SettingsService,
    @Inject(forwardRef(() => DateService))
    private dateService: DateService,
    @Inject(forwardRef(() => EncryptService))
    private encryptService: EncryptService
  ) {}

  verifyPasswordHash(password: string, hashPassword: string) {
    return bcrypt.compare(password, hashPassword);
  }
  async getAdminCriteria(actionType: string, user: any, params?: any) {
    const defaultAdminUsers = await this.settings.getItem(
      'default_admin_users'
    );
    const restrictAdminRole = await this.settings.getItem(
      'restrict_admin_groups'
    );
    let whereCond;
    if (actionType) {
      switch (actionType) {
        case 'delete':
          /**
           * Return where condition to restrict all "defaultAdminUsers" if
           * 1. They try to delete
           */
          if (_.isArray(defaultAdminUsers) && defaultAdminUsers.length > 0) {
            whereCond = `userName NOT IN (${defaultAdminUsers
              .map((ele) => `'${ele}'`)
              .join(',')})`;
          }

          break;
        case 'update':
          /**
           * Return 1 / 0 to restrict all "defaultAdminUsers" record update if
           * 1. They try to change status to "Inactive"
           * 2. They try to change roleId
           */
          if (
            params.status.toLowerCase() === 'inactive' ||
            params.roleId !== user.roleId
          ) {
            if (_.isArray(defaultAdminUsers) && defaultAdminUsers.length > 0) {
              if (defaultAdminUsers.includes(params.userName)) {
                whereCond = 0;
              } else {
                whereCond = 1;
              }
            }
          } else {
            whereCond = 1;
          }
          break;
        // case 'change_status':
        //   /**
        //    * Return where condition to restrict all "defaultAdminUsers" status update if
        //    * 1. They try to "Inactive"
        //    */
        //   if (params.status.toLowerCase() === 'inactive') {
        //     if (_.isArray(defaultAdminUsers) && defaultAdminUsers.length > 0) {
        //       whereCond = `'vUserName NOT IN (?)', [
        //         defaultAdminUsers,
        //       ])`;
        //     }
        //   }
        //   break;
        case 'details':
          if (restrictAdminRole && restrictAdminRole.length) {
            if (!restrictAdminRole.includes(user.roleCode)) {
              whereCond = `r.roleCode NOT IN (${restrictAdminRole
                .map((ele) => `'${ele}'`)
                .join(',')})`;
            }
          }
          break;
        case 'list':
          /**
           * Return where condition to restrict all "restrictAdminRole" users if
           * 1. Logged-in user "roleCode" doesn't matches with "restrictAdminRole"
           */
          if (_.isArray(restrictAdminRole) && restrictAdminRole.length > 0) {
            if (!restrictAdminRole.includes(user.roleCode)) {
              whereCond = `r.roleCode NOT IN (${restrictAdminRole
                .map((ele) => `'${ele}'`)
                .join(',')})`;
            }
          }
          break;
        default:
          break;
      }
    }
    return whereCond;
  }

  async getUserCriteria(actionType: string, user: any, params?: any) {
    const defaultAdminUsers = await this.settings.getItem(
      'default_admin_users'
    );
    const restrictAdminRole = await this.settings.getItem(
      'restrict_admin_groups'
    );
    let whereCond;
    if (actionType) {
      switch (actionType) {
        case 'delete':
          /**
           * Return where condition to restrict all "defaultAdminUsers" if
           * 1. They try to delete
           */
          if (_.isArray(defaultAdminUsers) && defaultAdminUsers.length > 0) {
            whereCond = `userName NOT IN (${defaultAdminUsers
              .map((ele) => `'${ele}'`)
              .join(',')})`;
          }

          break;
        case 'update':
          /**
           * Return 1 / 0 to restrict all "defaultAdminUsers" record update if
           * 1. They try to change status to "Inactive"
           * 2. They try to change roleId
           */
          if (
            params.status.toLowerCase() === 'inactive' ||
            params.roleId !== user.roleId
          ) {
            if (_.isArray(defaultAdminUsers) && defaultAdminUsers.length > 0) {
              if (defaultAdminUsers.includes(params.userName)) {
                whereCond = 0;
              } else {
                whereCond = 1;
              }
            }
          } else {
            whereCond = 1;
          }
          break;
        // case 'change_status':
        //   /**
        //    * Return where condition to restrict all "defaultAdminUsers" status update if
        //    * 1. They try to "Inactive"
        //    */
        //   if (params.status.toLowerCase() === 'inactive') {
        //     if (_.isArray(defaultAdminUsers) && defaultAdminUsers.length > 0) {
        //       whereCond = `'vUserName NOT IN (?)', [
        //         defaultAdminUsers,
        //       ])`;
        //     }
        //   }
        //   break;
        case 'details':
          if (restrictAdminRole && restrictAdminRole.length) {
            if (!restrictAdminRole.includes(user.roleCode)) {
              whereCond = `r.roleCode NOT IN (${restrictAdminRole
                .map((ele) => `'${ele}'`)
                .join(',')})`;
            }
          }
          break;
        case 'list':
          /**
           * Return where condition to restrict all "restrictAdminRole" users if
           * 1. Logged-in user "roleCode" doesn't matches with "restrictAdminRole"
           */
          if (_.isArray(restrictAdminRole) && restrictAdminRole.length > 0) {
            if (!restrictAdminRole.includes(user.roleCode)) {
              whereCond = `r.roleCode NOT IN (${restrictAdminRole
                .map((ele) => `'${ele}'`)
                .join(',')})`;
            }
          }
          break;
        default:
          break;
      }
    }
    return whereCond;
  }

  async getRoleCriteria(type: string, user: any, inputParams?: any) {
    let whereCond;
    const defaultAdminRole = await this.settings.getItem('default_admin_roles');
    const restrictAdminRole = await this.settings.getItem(
      'restrict_admin_roles'
    );
    if (type) {
      switch (type) {
        case 'delete':
          if (_.isArray(defaultAdminRole) && defaultAdminRole.length > 0) {
            whereCond = `roleCode NOT IN (${defaultAdminRole
              .map((ele) => `'${ele}'`)
              .join(',')})`;
          }

          break;
        case 'update':
          /**
           * Return 1 / 0 to restrict all "defaultAdminGroups" record update if
           * 1. They try to change status to "Inactive"
           * 2. They try to change roleId
           */
          if (inputParams.status.toLowerCase() === 'inactive') {
            if (_.isArray(defaultAdminRole) && defaultAdminRole.length > 0) {
              if (defaultAdminRole.includes(user.roleCode)) {
                whereCond = 0;
              } else {
                whereCond = 1;
              }
            }
          } else {
            whereCond = 1;
          }
          break;
        case 'change_status':
          /**
           * Return where condition to restrict all "defaultAdminGroups" status update if
           * 1. They try to "Inactive"
           */
          if (inputParams.status.toLowerCase() === 'inactive') {
            if (_.isArray(defaultAdminRole) && defaultAdminRole.length > 0) {
              whereCond = `r.roleCode NOT IN (${defaultAdminRole
                .map((ele) => `'${ele}'`)
                .join(',')})`;
            }
          }
          break;
        case 'details':
          /**
           * Return where condition to restrict all "restrictAdminRole" users if
           * 1. Logged-in user "roleCode" doesn't matches with "restrictAdminRole"
           */
          if (_.isArray(restrictAdminRole) && restrictAdminRole.length > 0) {
            if (!restrictAdminRole.includes(user.roleCode)) {
              whereCond = `r.roleCode NOT IN (${restrictAdminRole
                .map((ele) => `'${ele}'`)
                .join(',')})`;
            }
          }
          break;
        case 'list':
          /**
           * Return where condition to restrict all "restrictAdminRole" users if
           * 1. Logged-in user "roleCode" doesn't matches with "restrictAdminRole"
           */
          if (_.isArray(restrictAdminRole) && restrictAdminRole.length > 0) {
            if (!restrictAdminRole.includes(user.roleCode)) {
              whereCond = `r.roleCode NOT IN (${restrictAdminRole
                .map((ele) => `'${ele}'`)
                .join(',')})`;
            }
          }
          break;
        default:
          break;
      }
    }
    return whereCond;
  }
  async getAutocompleteWhere(body, tokenParams, extraConfig) {
    let whereClause = '';

    if ('type' in body && body.type !== 'all') {
      if (body.type.toLowerCase() === 'inactive') {
        whereClause = `${extraConfig.table_alias}.status IN ('Inactive')`;
      } else {
        whereClause = `${extraConfig.table_alias}.status IN ('Active')`;
      }
    }

    if (extraConfig.table_name === 'role') {
      const restrictedGroups = await this.settings.getItem(
        'restrict_admin_groups'
      );
      if (!restrictedGroups.includes(tokenParams.roleCode)) {
        const groupCodeClause = `${
          extraConfig.table_alias
        }.roleCode NOT IN (${restrictedGroups
          .map((ele) => `'${ele}'`)
          .join(',')})`;
        if (whereClause) {
          whereClause = `${whereClause} AND ${groupCodeClause}`;
        } else {
          whereClause = groupCodeClause;
        }
      }
    }
    return whereClause;
  }

  getDateDiff(dateLeft, dateRight, type) {
    return this.dateService.diff(dateLeft, dateRight, type);
  }

  getRandomNumber(length) {
    length = length > 0 ? length : 16;
    return randomize('0', length);
  }

  generateOTPCode() {
    return parseInt(this.getRandomNumber(6));
  }

  async encryptVerifyToken(keysObject) {
    const verifyToken = await this.encryptService.encryptContent(
      JSON.stringify(keysObject)
    );
    return verifyToken;
  }

  async decryptVerifyToken(token) {
    let tokenInfo;
    if (token) {
      const decodedStr = await this.encryptService.decryptContent(token);
      tokenInfo = JSON.parse(decodedStr);
    }
    return tokenInfo;
  }

  isEmpty = (str) =>
    _.isNull(str) ||
    _.isUndefined(str) ||
    (_.isString(str) && str.trim() === '');

  getHashChecksum(str, algorithm, encoding?) {
    return crypto
      .createHash(algorithm || 'md5')
      .update(str, 'utf8')
      .digest(encoding || 'hex');
  }
  getPasswordHash(password) {
    return bcrypt.hashSync(password, 10);
  }

  async encryptData(data, method) {
    method = method || 'cit';
    let encData;
    if (this.isEmpty(data)) {
      return encData;
    }
    switch (method) {
      case 'base64':
        encData = Base64.encode(data);
        break;
      case 'password_hash':
      case 'bcrypt':
        if (data === '*****') {
          encData = false;
        } else {
          encData = this.getPasswordHash(data);
        }
        break;
      case 'md5':
      case 'sha1':
      case 'sha256':
      case 'sha512':
        encData = this.getHashChecksum(data, method);
        break;
      default:
        encData = await this.encryptService.encryptContent(data);
        break;
    }
    return encData;
  }

  async encryptPassword(value) {
    return await this.encryptData(value, 'bcrypt');
  }

  comparePasswordHash(plainPwd, hashPwd) {
    return bcrypt.compareSync(plainPwd, hashPwd);
  }

  async verifyEncrypted(data, encData, method) {
    method = method || 'cit';
    let isMatched = false;
    if (this.isEmpty(data) || this.isEmpty(encData)) {
      return isMatched;
    }
    let decData;
    switch (method) {
      case 'base64':
        decData = Base64.decode(encData);
        if (data === decData) {
          isMatched = true;
        }
        break;
      case 'password_hash':
      case 'bcrypt':
        isMatched = this.comparePasswordHash(data, encData);
        break;
      case 'md5':
      case 'sha1':
      case 'sha256':
      case 'sha512':
        decData = this.getHashChecksum(data, method);
        if (decData === encData) {
          isMatched = true;
        }
        break;
      default:
        decData = await this.encryptService.decryptContent(data);
        if (decData === encData) {
          isMatched = true;
        }
        break;
    }
    return isMatched;
  }

  async verifyAdminResetPassword(oldPass, newPass) {
    const oldPassword = oldPass;
    const curPassword = newPass;
    const encryptType = 'bcrypt';

    let isMatched = 0;
    const verifyResult = await this.verifyEncrypted(
      oldPassword,
      curPassword,
      encryptType
    );
    if (verifyResult) {
      isMatched = 1;
    }

    let oldPasswordsLimit = Number(
      await this.settings.getItem('admin_password_history')
    );
    oldPasswordsLimit = oldPasswordsLimit || 5;

    return {
      isMatched: isMatched,
      oldPasswordsLimit: oldPasswordsLimit,
    };
  }

  async verifyAdminOldPasswords(oldPasswrds, old_password, new_password) {
    const oldPasswords = oldPasswrds;
    const oldPassword = old_password;
    const newPassword = new_password;
    const encryptType = 'bcrypt';

    let verifyResult = false;
    let isOldPassword = 0;

    if (oldPassword === newPassword) {
      isOldPassword = 1;
    } else {
      oldPasswords.forEach(async (val) => {
        if (!verifyResult) {
          verifyResult = await this.verifyEncrypted(
            newPassword,
            val.password,
            encryptType
          );
        }
      });
      if (verifyResult) {
        isOldPassword = 1;
      }
    }

    return {
      isOldPassword: isOldPassword,
    };
  }

  checkStartEndDate = (params) => {
    const validationResponse = {
      isDateValid: 0,
      errorMessage: 'Please enter valid date.',
    };
    if (params && params.filter && params.filter.length > 1) {
      const hasDateKeys = params.filter.some(
        (filterItem: any) =>
          filterItem.key === 'startDate' || filterItem.key === 'endDate'
      );
      if (hasDateKeys) {
        const { startDate, endDate } = params;
        if (
          startDate &&
          endDate &&
          this.dateService.compare(0, endDate) &&
          this.dateService.compare(endDate, startDate) &&
          this.dateService.compare(0, startDate)
        ) {
          if (!(this.dateService.diff(endDate, startDate, 'days') <= 93)) {
            validationResponse.errorMessage =
              'Difference of start date and end date should be 90 days';
          } else {
            validationResponse.isDateValid = 1;
          }
        }
      }
    } else {
      validationResponse.isDateValid = 1;
    }

    return validationResponse;
  };

  getDateTime(type, params) {
    let retValue: any;
    switch (type) {
      case 'date':
        retValue = this.dateService.getCurrentDate();
        break;
      case 'time':
        retValue = this.dateService.getCurrentTime();
        break;
      case 'datetime':
        retValue = this.dateService.getCurrentDateTime();
        break;
      case 'timestamp':
        retValue = this.dateService.getCurrentTimeStamp();
        break;
      case 'timems':
        retValue = this.dateService.getCurrentTimeMS();
        break;
      case 'datetime_after':
        retValue = this.dateService.getDateTimeAfter(params.value, params.type);
        break;
      case 'datetime_before':
        retValue = this.dateService.getDateTimeBefore(
          params.value,
          params.type
        );
        break;
      case 'sys_date':
        retValue = this.dateService.getDateSystemFormat(params.value);
        break;
      case 'sys_time':
        retValue = this.dateService.getTimeSystemFormat(params.value);
        break;
      case 'sys_datetime':
        retValue = this.dateService.getDateTimeSystemFormat(params.value);
        break;
      case 'cus_date':
        retValue = this.dateService.getDateCustomFormat(
          params.value,
          params.format
        );
        break;
      case 'cus_time':
        retValue = this.dateService.getTimeCustomFormat(
          params.value,
          params.format
        );
        break;
      case 'cus_datetime':
        retValue = this.dateService.getDateTimeCustomFormat(
          params.value,
          params.format
        );
        break;
      default:
        break;
    }
    return retValue;
  }
}
