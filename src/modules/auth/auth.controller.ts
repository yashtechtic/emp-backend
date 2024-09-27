import {
  Controller,
  Get,
  Post,
  Req,
  HttpStatus,
  Body,
  Inject,
  LoggerService,
  HttpException,
} from '@nestjs/common';
import _ from 'underscore';

import { SettingsService } from '@app/services/services/settings.service';
import { Custom } from '@app/utilities/custom.utility';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';

import {
  ValidateAdminDto,
  AdminLoginDto,
  resetPasswordDto,
  ChangePasswordDto,
  VerifyAdminEmailDto,
} from './dto/auth.dto';
import { addSeconds, getTime } from 'date-fns';
import { AuthService } from './auth.service';
import { GeneralUtility } from '@app/utilities/general.utility';
import { Condition, Status } from '@app/common-config/dto/common.dto';
import {
  IAdminData,
  IAdminValidationData,
  ICapability,
  IEmailData,
  IMenuItem,
  ITokenData,
} from '../../interfaces/auth.interface';
import { ACTIONS } from '@app/utilities/action';
import { MESSAGE } from '@app/utilities/message';
import { JwtTokenService } from '@app/services/services/jwt-token.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private authService: AuthService,
    private customUtility: Custom,
    private generalUtility: GeneralUtility,
    private settings: SettingsService,
    private jwtTokenService: JwtTokenService
  ) {}
  private entity = 'admin';

  // Admin Login

  @Post('login')
  async adminLogin(
    @Body() body: AdminLoginDto
  ): Promise<IApiResponse<IAdminData>> {
    try {
      const result = {
        statusCode: HttpStatus.UNAUTHORIZED,
        action: ACTIONS.INVALID_CREDENTIAL,
        success: SUCCESS.false,
        data: {},
      };
      let getAccessToken;

      const adminData = await this.authService.checkAdminData(
        'email',
        body.email
      );
      if (!adminData) {
        result.statusCode = HttpStatus.UNAUTHORIZED;
      } else {
        if (adminData.password) {
          const isPassword = await this.generalUtility.verifyPasswordHash(
            body.password,
            adminData.password
          );

          if (isPassword) {
            if (adminData.status === Status.Inactive) {
              result.statusCode = HttpStatus.UNAUTHORIZED;
              result.action = ACTIONS.TEMPORARILY_INACTIVATED;
            } else if (adminData.roleStatus === Status.Inactive) {
              result.statusCode = HttpStatus.UNAUTHORIZED;
              result.action = ACTIONS.TEMPORARILY_INACTIVATED;
            } else {
              const tokenDetails = {
                userId: adminData.adminId,
                userName: `${adminData.firstName} ${adminData.lastName}`,
                email: adminData.email,
                phoneNumber: adminData.phoneNumber,
                status: adminData.status,
                roleId: adminData.roleId,
                roleName: adminData.roleName,
                roleCode: adminData.roleCode,
                roleStatus: adminData.roleStatus,
              };
              getAccessToken =
                await this.jwtTokenService.createAPIToken(tokenDetails);
              if (getAccessToken && getAccessToken.success) {
                result.success = SUCCESS.true;
                result.action = ACTIONS.LOGIN;
                result.data = {
                  ...tokenDetails,
                  access_token: getAccessToken.token,
                };
              } else {
                result.action = getAccessToken.message;
                result.statusCode = getAccessToken.statusCode;
              }
            }
          }
        } else {
          result.action = ACTIONS.PASSWORD_NOT_CREATED;
        }
      }
      console.log('result--->', result)
      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: `${adminData.firstName} ${adminData.lastName}`,
        statusCode: result.statusCode,
        data: result.data,
      });
    } catch (err) {
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('logout')
  async adminLogout(@Req() req: any) {
    try {
      if (req.user.logId > SUCCESS.false) {
        await this.authService.updateAdminLogout(
          req.user.logId,
          req.user.adminId
        );
      }

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: ACTIONS.LOGOUT,
        statusCode: HttpStatus.OK,
        data: {},
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Admin Change Password
  @Post('change-password')
  async adminChangePassword(
    @Body() body: ChangePasswordDto,
    @Req() req
  ): Promise<IApiResponse> {
    try {
      const result = {
        statusCode: HttpStatus.BAD_REQUEST,
        action: ACTIONS.ALREADY_USED_PASSWORD,
        success: SUCCESS.false,
        data: {},
      };
      const { userId: adminId } = req.user;
      console.log(adminId);

      const adminDetails = await this.authService.getAdminDetails(adminId);

      const verifyResetPassword =
        await this.generalUtility.verifyAdminResetPassword(
          body.oldPassword,
          adminDetails.password
        );

      if (adminDetails && verifyResetPassword.isMatched) {
        const oldPasswords = await this.authService.getAdminPasswords(
          'adminId',
          adminId,
          verifyResetPassword.oldPasswordsLimit
        );

        const verifyOldPasswords =
          await this.generalUtility.verifyAdminOldPasswords(
            oldPasswords,
            body.oldPassword,
            body.newPassword
          );

        if (verifyOldPasswords.isOldPassword === SUCCESS.false) {
          const encryptedPassword = await this.generalUtility.encryptPassword(
            body.newPassword
          );

          const updateData = {
            password: encryptedPassword,
          };

          const updateAdmin = await this.authService.updateAdminPassword(
            updateData,
            'adminId',
            adminId
          );

          const prepareInsertData = {
            adminId,
            password: adminDetails.password,
            addedDate: new Date(),
            status: Status.Active,
          };

          if (updateAdmin.affected) {
            await this.authService.insertAdminPasswords(prepareInsertData);

            result.success = SUCCESS.true;
            result.action = ACTIONS.PASSWORD_CHANGED;
            result.statusCode = HttpStatus.OK;
          }
        }
      } else {
        result.action = ACTIONS.OLD_PASSWORD_MISMATCH;
      }

      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: this.entity,
        data: result.data,
        statusCode: result.statusCode,
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Admin Reset Password
  @Post('reset-password')
  async adminResetPassword(
    @Body() body: resetPasswordDto
  ): Promise<IApiResponse> {
    try {
      const result = {
        statusCode: HttpStatus.BAD_REQUEST,
        action: ACTIONS.OTP_MISMATCH,
        success: SUCCESS.false,
        data: {},
      };

      const tokenInfo = await this.generalUtility.decryptVerifyToken(
        body.token
      );

      if (tokenInfo) {
        const adminData = await this.authService.checkAdminData(
          'email',
          tokenInfo.email
        );
        if (adminData && adminData.otpCode === body.otpCode) {
          adminData.password = await this.generalUtility.encryptPassword(
            body.password
          );

          const prepareUpdateData = {
            password: adminData.password,
            isEmailVerified: Condition.Yes,
            otpCode: null,
            modifiedDate: new Date(),
          };

          const adminUpdate = await this.authService.updateAdminPassword(
            prepareUpdateData,
            'adminId',
            adminData.adminId
          );

          if (adminUpdate.affected) {
            result.success = SUCCESS.true;
            result.action = ACTIONS.PASSWORD_UPDATED;
            result.statusCode = HttpStatus.OK;
          }
        }
      } else {
        result.action = ACTIONS.INVALID_TOKEN;
      }

      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: this.entity,
        data: result.data,
        statusCode: result.statusCode,
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Admin Forgot Password
  @Post('forgot-password')
  async adminForgotPassword(@Body() body): Promise<IApiResponse<ITokenData>> {
    try {
      const result = {
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.USER_NOT_FOUND,
        success: SUCCESS.false,
        data: {},
      };

      const adminDetails = await this.authService.checkAdminData(
        'email',
        body.email
      );

      console.log('adminDetails', adminDetails);

      if (adminDetails) {
        const expirySec = await this.settings.getItem('OTP_EXPIRY_SECONDS');
        const expiryTime = this.generalUtility.getDateTime('datetime_after', {
          value: expirySec,
          type: 'seconds',
        });
        const tokenIssued = this.generalUtility.getDateTime('timems', {});
        const tokenExpire = getTime(new Date(expiryTime));
        const verifyCode = this.generalUtility.generateOTPCode();

        const encToken = await this.generalUtility.encryptVerifyToken({
          type: 'forgot',
          email: body.email.toLowerCase(),
          code: verifyCode,
          iat: tokenIssued,
          exp: tokenExpire,
        });
        const resetLink = `${await this.settings.getItem(
          'admin_url'
        )}/verify-email/${encToken}`;

        const verifyEmailLink = {
          token: encToken,
          verifyCode: verifyCode,
          resetLink: resetLink,
          expireMin: expirySec / 60,
        };

        const updateAdminOtp = await this.authService.updateOtpCode(
          verifyEmailLink.verifyCode,
          adminDetails.adminId
        );

        if (updateAdminOtp.affected) {
          result.success = SUCCESS.true;
          result.action = ACTIONS.OTP_SENT;
          result.statusCode = HttpStatus.OK;
          result.data = { token: verifyEmailLink.token };
        }
      }

      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: this.entity,
        data: result.data,
        statusCode: result.statusCode,
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Admin Token Verification
  @Post('token-verification')
  async tokenVerification(@Body() body): Promise<IApiResponse<IEmailData>> {
    try {
      const result = {
        statusCode: HttpStatus.BAD_REQUEST,
        action: ACTIONS.VERIFICATION_LINK_EXPIRED,
        success: SUCCESS.false,
        data: {},
      };

      const tokenInfo = await this.generalUtility.decryptVerifyToken(
        body.token
      );
      const returnObj = {
        email: tokenInfo.email,
        time: 0,
      };
      if ('exp' in tokenInfo) {
        const currentTime = await this.generalUtility.getDateTime('timems', {});

        returnObj.time = await this.generalUtility.getDateDiff(
          tokenInfo.exp,
          currentTime,
          'seconds'
        );
      } else {
        returnObj.time = await this.settings.getItem('OTP_EXPIRY_SECONDS');
      }

      const adminDetails = await this.authService.checkAdminData(
        'email',
        tokenInfo.email
      );

      if (
        adminDetails.emailVerified === Condition.Yes &&
        !adminDetails.verificationCode
      ) {
        result.action = ACTIONS.ACCOUNT_ACTIVATED;
        result.statusCode = HttpStatus.OK;
      } else {
        if (returnObj.time > 0) {
          result.action = ACTIONS.TOKEN_VALID;
          result.success = SUCCESS.true;
          result.data = returnObj;
        }
      }

      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: this.entity,
        data: result.data,
        statusCode: result.statusCode,
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Validate Admin
  @Post('validate')
  async validateAdmin(
    @Body() body: ValidateAdminDto
  ): Promise<IApiResponse<IAdminValidationData>> {
    try {
      const result = {
        statusCode: HttpStatus.BAD_REQUEST,
        action: ACTIONS.EMAIL_ENTRY,
        success: SUCCESS.false,
        data: {},
      };

      const adminData = await this.authService.findAdminByEmail(body.email);

      if (!!adminData) {
        if (adminData.emailVerified === Condition.No) {
          result.statusCode = HttpStatus.UNAUTHORIZED;
          result.action = ACTIONS.ACCOUNT_NOT_VERIFIED;
        } else if (adminData.status === Status.Inactive) {
          result.statusCode = HttpStatus.FORBIDDEN;
          result.action = ACTIONS.ACCOUNT_NOT_ACTIVE;
        } else {
          result.success = SUCCESS.true;
          result.action = ACTIONS.USER_EMAIL_EXIST;
          result.statusCode = HttpStatus.OK;
          result.data = { name: adminData.name };
        }
      }

      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: this.entity,
        data: result.data,
        statusCode: result.statusCode,
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Capabilities
  @Get('capabilities')
  async capabilities(@Req() req): Promise<IApiResponse<ICapability>> {
    try {
      const result = {
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.CAPS_NOT_FOUND,
        success: SUCCESS.false,
        data: {},
      };
      let capabilityList = [];

      const adminGroupData = await this.authService.getAdminGroupData(
        req.user.adminId
      );

      if (adminGroupData) {
        const restrictAdminGroups = await this.settings.getItem(
          'restrict_admin_groups'
        );
        if (
          _.isArray(restrictAdminGroups) &&
          restrictAdminGroups.includes(req.user.roleCode)
        ) {
          const roleCapabilities = await this.authService.getCapabilities();
          if (roleCapabilities && roleCapabilities.length) {
            roleCapabilities.forEach((row) => {
              capabilityList.push(row.capability);
            });
          }
        } else {
          capabilityList = JSON.parse(adminGroupData.roleCapabilities);
        }

        if (!_.isArray(capabilityList)) {
          capabilityList = [];
        }
      }

      if (!_.isEmpty(capabilityList)) {
        result.success = SUCCESS.true;
        result.action = ACTIONS.CAPS_FOUND;
        result.statusCode = HttpStatus.OK;
        result.data = { list: capabilityList };
      }
      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: this.entity,
        data: result.data,
        statusCode: result.statusCode,
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Menu
  @Get('menu')
  async adminMenu(): Promise<IApiResponse<IMenuItem>> {
    try {
      const result = {
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NO_MENU,
        success: SUCCESS.false,
        data: [],
      };

      let parentMenus = await this.authService.getMenu(0);

      if (parentMenus && parentMenus.length) {
        parentMenus = parentMenus.map(async (item) => {
          const childMenu = await this.authService.getMenu(item.adminMenuId);
          if (childMenu) {
            item.subMenu.push(...childMenu);
            return item;
          }
        });
      }
      const finalMenus = await Promise.all(parentMenus);
      if (finalMenus && finalMenus.length) {
        result.success = SUCCESS.true;
        result.statusCode = HttpStatus.OK;
        result.action = ACTIONS.MENU_FOUND;
        result.data = finalMenus;
      }

      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: this.entity,
        data: result.data,
        statusCode: result.statusCode,
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Verify Admin Email
  @Post('verify-admin-email')
  async verifyAdminEmail(
    @Body() body: VerifyAdminEmailDto
  ): Promise<IApiResponse> {
    try {
      const result = {
        statusCode: HttpStatus.BAD_REQUEST,
        action: ACTIONS.INVALID_VERIFY_TOKEN,
        entity: this.entity,
        success: SUCCESS.false,
        data: {},
      };

      const tokenInfo = await this.generalUtility.decryptVerifyToken(
        body.verifyToken
      );

      if (
        !this.generalUtility.isEmpty(tokenInfo.code) &&
        !this.generalUtility.isEmpty(tokenInfo.email)
      ) {
      }
      const userInfo = await this.authService.getAdminByEmailCode(tokenInfo);

      if (userInfo) {
        const { adminId } = userInfo;
        const emailVerify =
          await this.authService.updateAdminEmailVerified(adminId);

        if (emailVerify.affected > SUCCESS.false) {
          result.action = ACTIONS.EMAIL_VERIFIED;
          result.statusCode = HttpStatus.OK;
          result.success = SUCCESS.true;
        }
      }
      return this.customUtility.getResponseTemplate(result);
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Resend Admin Verify Email
  @Post('resend-admin-verify-email')
  async resendAdminVerifyEmail(@Req() req: any): Promise<IApiResponse> {
    try {
      const result = {
        statusCode: HttpStatus.BAD_REQUEST,
        action: ACTIONS.USER_NOT_EXIST,
        entity: this.entity,
        success: SUCCESS.false,
        data: {},
      };
      const adminData = await this.authService.getAdminDataById(
        req.user.adminId
      );

      if (adminData) {
        const verifyCode = this.generalUtility.generateOTPCode();

        const updateVerificationCode =
          await this.authService.updateEmailVerifyCode(
            adminData.adminId,
            verifyCode
          );

        if (updateVerificationCode.affected > SUCCESS.false) {
          const tokenObject = {
            email: adminData.email,
            code: verifyCode,
          };

          const encToken =
            await this.generalUtility.encryptVerifyToken(tokenObject);
          const verifyLink = `${await this.settings.getItem(
            'admin_url'
          )}/verify-email/${encToken}`;

          result.success = SUCCESS.true;
          result.statusCode = HttpStatus.OK;
          result.action = ACTIONS.EMAIL_VERIFY_SEND;
        }
      }
      return this.customUtility.getResponseTemplate(result);
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
