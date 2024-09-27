/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpStatus } from '@nestjs/common';
import { ACTIONS } from './action';
import {
  IResponseTemplate,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';
import { MESSAGE } from './message';

type ResponseData = {
  success: SUCCESS;
  action: ACTIONS;
  entity?: string;
  statusCode: HttpStatus;
  data?: any;
  token?: string;
  message?: string;
};
// @Injectable()
export class Custom {
  constructor() {}
  getResponseTemplate = (result: ResponseData): IResponseTemplate => {
    console.log(result, '=================');
    const { success, action, entity, data, statusCode, token, message } =
      result;

    const response = {
      settings: {
        success,
        message: message || MESSAGE[action](entity),
        status: statusCode || HttpStatus.OK,
      },
      data: data && data.data ? data.data : data || {},
    };

    token ? (response.settings['access_token'] = token) : undefined;
    data && data.paging
      ? (response.settings = { ...response.settings, ...data.paging })
      : undefined;
    return response;
  };

  isExternalURL = (url) => {
    let flag = false;
    if (url) {
      url = url.trim().toLowerCase();
      if (url.substr(0, 8) === 'https://' || url.substr(0, 7) === 'http://') {
        flag = true;
      }
    }
    return flag;
  };

  getIPAddress = (req) => {
    let ipAddress = '';
    if (req.headers['X-Forwarded-For']) {
      [ipAddress] = req.headers['X-Forwarded-For'].split(',');
    } else if (req.headers['x-forwarded-for']) {
      [ipAddress] = req.headers['x-forwarded-for'].split(',');
    } else if (req.client.remoteAddress) {
      ipAddress = req.client.remoteAddress;
    } else if (req.connection.remoteAddress) {
      ipAddress = req.connection.remoteAddress;
    } else {
      ipAddress = req.socket.remoteAddress;
    }
    return ipAddress;
  };
}
