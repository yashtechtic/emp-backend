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
  UserLoginDto,
  resetPasswordDto,
  ChangePasswordDto,
  VerifyUserEmailDto,
} from './dto/auth.dto';
import { getTime } from 'date-fns';
import { UserAuthService } from './user-auth.service';
import { GeneralUtility } from '@app/utilities/general.utility';
import { Condition, Status } from '@app/common-config/dto/common.dto';
import {
  ICapability,
  IEmailData,
  ITokenData,
  IUserData,
} from '../../interfaces/companies/user-auth.interface';
import { ACTIONS } from '@app/utilities/action';
import { MESSAGE } from '@app/utilities/message';
import { JwtTokenService } from '@app/services/services/jwt-token.service';
import { CompanyService } from '@app/modules/company/company.service';

@Controller('user-auth')
export class UserAuthController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private userAuthService: UserAuthService,
    private customUtility: Custom,
    private generalUtility: GeneralUtility,
    private settings: SettingsService,
    private jwtTokenService: JwtTokenService,
    private companyService: CompanyService
  ) {}
  private entity = 'User';

  // User Login

  @Post('login')
  async userLogin(
    @Body() body: UserLoginDto
  ): Promise<IApiResponse<IUserData>> {
    try {
      const result = {
        statusCode: HttpStatus.OK,
        action: ACTIONS.INVALID_CREDENTIAL,
        success: SUCCESS.false,
        data: {},
      };
      let getAccessToken;

      const userData = await this.userAuthService.checkUserData(
        'email',
        body.email
      );

      if (!userData) {
        result.statusCode = HttpStatus.UNAUTHORIZED;
      } else {
        if (userData.password) {
          const isPassword = await this.generalUtility.verifyPasswordHash(
            body.password,
            userData.password
          );

          if (isPassword) {
            if (userData.status === Status.Inactive) {
              result.statusCode = HttpStatus.UNAUTHORIZED;
              result.action = ACTIONS.TEMPORARILY_INACTIVATED;
            }
            //  if (userData.groupStatus === Status.Inactive) {
            //   result.statusCode = HttpStatus.UNAUTHORIZED;
            //   result.action = ACTIONS.TEMPORARILY_INACTIVATED;
            // } else
            else {
              const tokenDetails = {
                userId: userData.userId,
                companyId: userData.companyId,
                userName: `${userData.firstName} ${userData.lastName}`,
                email: userData.email,
                phoneNumber: userData.phoneNumber,
                status: userData.status,
                roleId: userData.roleId,
                roleName: userData.roleName,
                roleCode: userData.roleCode,
                groupStatus: userData.groupStatus,
              };
              getAccessToken =
                await this.jwtTokenService.createAPIToken(tokenDetails);
              if (getAccessToken && getAccessToken.success) {
                result.success = SUCCESS.true;
                result.action = ACTIONS.LOGIN;
                console.log('tokenDetails-->', tokenDetails);
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
      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: `${userData?.firstName} ${userData?.lastName}` || '',
        statusCode: result.statusCode,
        data: result.data,
      });
    } catch (err) {
      console.log('err--->', err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // User Change Password
  @Post('change-password')
  async userChangePassword(
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
      const { userId } = req.user;

      const userDetails = await this.userAuthService.getUserDetails(userId);

      const encryptedPassword = await this.generalUtility.encryptPassword(
        body.newPassword
      );

      const updateData = {
        password: encryptedPassword,
      };

      const updateUser = await this.userAuthService.updateUserPassword(
        updateData,
        'userId',
        userId
      );

      if (updateUser.affected) {
        result.success = SUCCESS.true;
        result.action = ACTIONS.PASSWORD_CHANGED;
        result.statusCode = HttpStatus.OK;
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

  // User Reset Password
  @Post('reset-password')
  async userResetPassword(
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
        const userData = await this.userAuthService.checkUserData(
          'email',
          tokenInfo.email
        );
        console.log(userData.otpCode, body.otpCode);
        if (userData && userData.otpCode == body.otpCode) {
          userData.password = await this.generalUtility.encryptPassword(
            body.password
          );

          const prepareUpdateData = {
            password: userData.password,
            isEmailVerified: Condition.Yes,
            otpCode: null,
            modifiedDate: new Date(),
          };

          const userUpdate = await this.userAuthService.updateUserPassword(
            prepareUpdateData,
            'userId',
            userData.userId
          );

          if (userUpdate.affected) {
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

  // User Forgot Password
  @Post('forgot-password')
  async userForgotPassword(@Body() body): Promise<IApiResponse<ITokenData>> {
    try {
      const result = {
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.USER_NOT_FOUND,
        success: SUCCESS.false,
        data: {},
      };

      const userDetails = await this.userAuthService.checkUserData(
        'email',
        body.email
      );

      if (userDetails) {
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

        const updateUserOtp = await this.userAuthService.updateOtpCode(
          verifyEmailLink.verifyCode,
          userDetails.userId
        );

        if (updateUserOtp.affected) {
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

  // User Token Verification
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

      const userDetails = await this.userAuthService.checkUserData(
        'email',
        tokenInfo.email
      );

      if (
        userDetails.emailVerified === Condition.Yes &&
        !userDetails.verificationCode
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

  // // Validate Admin
  // @Post('validate')
  // async validateAdmin(
  //   @Body() body: ValidateAdminDto
  // ): Promise<IApiResponse<IAdminValidationData>> {
  //   try {
  //     const result = {
  //       statusCode: HttpStatus.BAD_REQUEST,
  //       action: ACTIONS.EMAIL_ENTRY,
  //       success: SUCCESS.false,
  //       data: {},
  //     };

  //     const adminData = await this.userAuthService.findAdminByEmail(body.email);

  //     if (!!adminData) {
  //       if (adminData.emailVerified === Condition.No) {
  //         result.statusCode = HttpStatus.UNAUTHORIZED;
  //         result.action = ACTIONS.ACCOUNT_NOT_VERIFIED;
  //       } else if (adminData.status === Status.Inactive) {
  //         result.statusCode = HttpStatus.FORBIDDEN;
  //         result.action = ACTIONS.ACCOUNT_NOT_ACTIVE;
  //       } else {
  //         result.success = SUCCESS.true;
  //         result.action = ACTIONS.USER_EMAIL_EXIST;
  //         result.statusCode = HttpStatus.OK;
  //         result.data = { name: adminData.name };
  //       }
  //     }

  //     return this.customUtility.getResponseTemplate({
  //       success: result.success,
  //       action: result.action,
  //       entity: this.entity,
  //       data: result.data,
  //       statusCode: result.statusCode,
  //     });
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw new HttpException(
  //       MESSAGE.DEFAULT_MESSAGE(),
  //       HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

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

      const userGroupData = await this.userAuthService.getUserGroupData(
        req.user.userId
      );

      if (userGroupData) {
        const restrictUserGroups = await this.settings.getItem(
          'restrict_user_groups'
        );
        if (
          _.isArray(restrictUserGroups) &&
          restrictUserGroups.includes(req.user.roleCode)
        ) {
          const roleCapabilities = await this.userAuthService.getCapabilities();
          if (roleCapabilities && roleCapabilities.length) {
            roleCapabilities.forEach((row) => {
              capabilityList.push(row.capability);
            });
          }
        } else {
          capabilityList = JSON.parse(userGroupData.roleCapabilities);
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

  // Verify user Email
  @Post('verify-user-email')
  async verifyAdminEmail(
    @Body() body: VerifyUserEmailDto
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
      const userInfo = await this.userAuthService.getUserByEmailCode(tokenInfo);

      if (userInfo) {
        const { userId } = userInfo;
        const emailVerify =
          await this.userAuthService.updateUserEmailVerified(userId);

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
  @Post('resend-user-verify-email')
  async resendUserVerifyEmail(@Req() req: any): Promise<IApiResponse> {
    try {
      const result = {
        statusCode: HttpStatus.BAD_REQUEST,
        action: ACTIONS.USER_NOT_EXIST,
        entity: this.entity,
        success: SUCCESS.false,
        data: {},
      };
      const userData = await this.userAuthService.getUserDataById(
        req.user.userData
      );

      if (userData) {
        const verifyCode = this.generalUtility.generateOTPCode();

        const updateVerificationCode =
          await this.userAuthService.updateEmailVerifyCode(
            userData.userId,
            verifyCode
          );

        if (updateVerificationCode.affected > SUCCESS.false) {
          const tokenObject = {
            email: userData.email,
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
