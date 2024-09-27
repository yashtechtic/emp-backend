import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import _ from 'underscore';

import { SettingsService } from '@app/services/services/settings.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class JwtTokenService {
  constructor(
    private jwtService: JwtService,
    private settings: SettingsService,

    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly log: LoggerService
  ) {}

  async createAPIToken(apiResult) {
    const response = {
      success: 0,
      message: '',
      token: '',
    };
    try {
      if (!_.isArray(apiResult) && !_.isObject(apiResult)) {
        const err = { code: 404, message: 'No data found.' };
        throw err;
      }

      const secretKey = await this.settings.getItem('WS_AUTH_TOKEN_PUBLIC_KEY');
      if (_.isEmpty(secretKey)) {
        const err = { code: 404, message: 'Authentication key not found.' };
        throw err;
      }

      const expiryTime = await this.settings.getItem(
        'WS_AUTH_TOKEN_EXPIRE_TIME'
      );

      const tokenExpiry = Number(expiryTime) * 60 * 60;

      const tokenIssuer = await this.settings.getItem('API_URL');

      const tokenAudience = await this.settings.getItem('API_URL');

      const tokenAlgo = 'HS256';

      const tokenOptions: any = {
        algorithm: tokenAlgo,
        issuer: tokenIssuer,
        audience: tokenAudience,
        expiresIn: tokenExpiry,
      };
      const jwtToken = this.jwtService.sign(
        { ...apiResult },
        {
          secret: process.env.JWT_SECRET,
          ...tokenOptions,
        }
      );

      response.success = 1;
      response.message = 'JWT token created';
      response.token = jwtToken ? jwtToken.toString() : '';
    } catch (err) {
      if (typeof err === 'object') {
        if (err.message) {
          response.message = err.message;
        } else {
          response.message = 'Unable to show error message.';
        }
      } else if (typeof err === 'string') {
        response.message = err;
      }
      this.log.error('JWT Create API Token Error: ', err);
    }
    return response;
  }
}
