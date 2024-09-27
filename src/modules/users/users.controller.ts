import {
  Controller,
  Get,
  Inject,
  Param,
  LoggerService,
  HttpStatus,
  Post,
  Req,
  Body,
  Delete,
  Query,
  HttpException,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { Custom } from '@app/utilities/custom.utility';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { CheckAdminEmailDto, UserDto } from './dto/user.dto';
import {
  AutocompleteDto,
  ChangeStatus,
  ListDto,
} from '@app/common-config/dto/common.dto';
import { addSeconds } from 'date-fns';

import { SettingsService } from '@app/services/services/settings.service';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';
import {
  IUserAutocomplete,
  IUserData,
  IUserList,
  IUserRecord,
} from '../../interfaces/companies/user.interface';

import { ACTIONS } from '@app/utilities/action';
import { MESSAGE } from '@app/utilities/message';

import { ListUtility } from '@app/utilities/list.utility';
import { GeneralUtility } from '@app/utilities/general.utility';
import { UsersService } from './users.service';
import { CommonConfigService } from '@app/common-config/common-config.service';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private userService: UsersService,
    private customUtility: Custom,
    private listUtility: ListUtility,
    private generalUtility: GeneralUtility,
    private settings: SettingsService,
    private commonService: CommonConfigService
  ) {}
  private entity = 'users';

  // Uers List
  @Post('list')
  async userList(
    @Req() req,
    @Body() body: ListDto
  ): Promise<IApiResponse<IUserList>> {
    try {
      const userListCond = await this.generalUtility.getUserCriteria(
        'list',
        req.user
      );

      const userDetails = await this.userService.findAllUsers(
        body,
        userListCond
      );
      userDetails.data = await this.commonService.getImageUrl(
        userDetails.data,
        'employee_image'
      );
      const isSuccess: boolean = userDetails && userDetails.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: 1,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? userDetails : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // User Autocomplete
  @Get('autocomplete')
  async adminAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<IUserAutocomplete>> {
    try {
      // const extraConfig = {
      //   table_name: 'users',
      //   table_alias: 'us',
      //   primary_key: 'userId',
      // };
      // const extraWhere = await this.generalUtility.getAutocompleteWhere(
      //   body,
      //   req.user,
      //   extraConfig
      // );

      const extraWhere = '';
      const userResults = await this.userService.getUserAutocomplete(
        extraWhere,
        body.keyword
      );

      const isSuccess = Boolean(
        userResults && userResults.length > SUCCESS.false
      );

      return this.customUtility.getResponseTemplate({
        success: 1,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? userResults : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // User Details
  @Get(':id')
  async userDetails(@Param('id') id: number): Promise<IApiResponse<IUserData>> {
    try {
      // const whereCond = await this.generalUtility.getUserCriteria(
      //   'details',
      //   req.user
      // );

      let userDetails = await this.userService.findOneUser(id, 'userId', '');
      userDetails = await this.commonService.getImageUrl(
        userDetails,
        'employee_image'
      );

      const isSuccess = Boolean(userDetails);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: userDetails || {},
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  //User Add
  @Post('add')
  async userCreate(@Body() body: UserDto): Promise<IApiResponse<IUserRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };
      const userDetails = await this.userService.checkUserEmail(body.email);
      if (userDetails) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.EMAIL_EXIST;
      } else {
        const resetCode = this.generalUtility.generateOTPCode();

        const expirySeconds = await this.settings.getItem('OTP_EXPIRY_SECONDS');
        console.log('expirySeconds', expirySeconds);

        const expiryTime = addSeconds(new Date(), expirySeconds);

        // const tokenInfo = {
        //   email: body.email.toLowerCase(),
        //   code: resetCode,
        //   pass: 1,
        //   exp: expiryTime,
        // };

        //  const encToken = await this.generalUtility.encryptVerifyToken(tokenInfo);

        // const verifyLink = `${await this.settings.getItem(
        //   'admin_url'
        // )}/verify-email/${encToken}`;

        const prepareData = {
          ...body,
          timeZone: body.timeZone,
          otpCode: resetCode,
          otpExpiryTime: expiryTime,
          address: body.address,
          postalCode: body.postalCode,
          userName: `${body.firstName} ${body.lastName}`,
        };

        const uploadInfo = await this.commonService.processAndValidateFile(
          body.image
        );

        if ('name' in uploadInfo) {
          body.image = uploadInfo.name;
        }

        const addedUser = await this.userService.createUser(prepareData);
        if (addedUser) {
          uploadInfo.folderName = 'employee_image/';
          this.commonService.uploadFolderImage(uploadInfo);
          result.success = 1;
          result.statusCode = HttpStatus.CREATED;
          result.action = ACTIONS.ADDED;
          result.data = {
            userId: addedUser.identifiers[0].userId,
          };
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

  // User Update
  @Put(':id')
  async userUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UserDto
  ): Promise<IApiResponse<IUserRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };

      const userData = await this.userService.checkUserExists(id);

      if (userData) {
        const getUserEmailForUpdate = await this.userService.checkUserEmail(
          body.email,
          id
        );
        if (getUserEmailForUpdate) {
          result.statusCode = HttpStatus.CONFLICT;
          result.action = ACTIONS.EMAIL_EXIST;
        } else {
          const userDetails = await this.userService.findOneUser(id, 'userId');
          const canUpdate: boolean = await this.generalUtility.getUserCriteria(
            'update',
            userDetails,
            body
          );

          if (!canUpdate) {
            result.statusCode = HttpStatus.FORBIDDEN;
            result.action = ACTIONS.STATUS_GRP_CH_NOT_ALLOWED;
          } else {
            const uploadInfo = await this.commonService.processAndValidateFile(
              body.image
            );
            if ('name' in uploadInfo) {
              body.image = uploadInfo.name;
            }
            const updateUser = await this.userService.updateUser(
              body,
              'adminId',
              userDetails.userId
            );

            if (updateUser.affected) {
              uploadInfo.folderName = 'employee_image/';
              this.commonService.uploadFolderImage(uploadInfo);
              result.success = 1;
              result.statusCode = HttpStatus.OK;
              result.action = ACTIONS.UPDATED;
              result.data = {
                adminId: id,
              };
            }
          }
        }
      } else {
        result.statusCode = HttpStatus.BAD_REQUEST;
        result.action = ACTIONS.NOT_EXIST;
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

  // User Delete
  @Delete(':id')
  async userDelete(@Param('id') id: number): Promise<IApiResponse> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_DELETED,
        data: {},
      };

      const userDetails = await this.userService.findOneUser(id, 'userId');

      if (userDetails) {
        const whereCond: string = await this.generalUtility.getUserCriteria(
          'delete',
          userDetails
        );

        if (!!whereCond) {
          const deleteUser = await this.userService.deleteUser(id, whereCond);

          if (deleteUser.affected) {
            result.success = 1;
            result.statusCode = HttpStatus.OK;
            result.action = ACTIONS.DELETED;
          } else {
            result.statusCode = HttpStatus.FORBIDDEN;
            result.action = ACTIONS.ADMIN_CANT_DELETED;
          }
        }
      } else {
        result.statusCode = HttpStatus.BAD_REQUEST;
        result.action = ACTIONS.NOT_EXIST;
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

  // User Change Status
  @Post('change-status')
  async userChangeStatus(@Body() body: ChangeStatus): Promise<IApiResponse> {
    try {
      const userChangeStatus = await this.userService.updateStatusUser(
        body.ids,
        body.status
      );

      const isSuccess = Boolean(userChangeStatus.affected);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        statusCode: HttpStatus.OK,
        action: isSuccess ? ACTIONS.CHANGE_STATUS : ACTIONS.STATUS_NOT_CHANGE,
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Check User Email
  @Post('user-email')
  async checkUserEmail(
    @Body() body: CheckAdminEmailDto
  ): Promise<IApiResponse> {
    try {
      const checkEmail = await this.userService.checkUserEmail(
        body.email,
        Number(body.id)
      );

      return this.customUtility.getResponseTemplate({
        success: checkEmail ? SUCCESS.false : SUCCESS.true,
        statusCode: checkEmail ? HttpStatus.CONFLICT : HttpStatus.OK,
        action: checkEmail ? ACTIONS.EMAIL_EXIST : ACTIONS.EMAIL_AVAILABLE,
        entity: this.entity,
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // // Admin Identity
  // @Get('identity')
  // async getUserIdentity(@Req() req): Promise<IApiResponse<IUserData>> {
  //   try {
  //     let prepareData = {};

  //     const { adminId, roleId } = req.user;
  //     const user = await this.userService.adminIdentity(adminId, roleId);

  //     if (user) {
  //       // Get restricted admin identity
  //       const restrictAdminGroups = await this.settings.getItem(
  //         'restrict_admin_groups'
  //       );

  //       const { roleCode } = user;
  //       if (restrictAdminGroups && restrictAdminGroups.includes(roleCode)) {
  //         const getGroupCapabitilty = await this.userService.getCapabilities();

  //         const capability = [];
  //         if (getGroupCapabitilty && getGroupCapabitilty.length) {
  //           getGroupCapabitilty.forEach((ele) => {
  //             capability.push(ele.capabilityCode);
  //           });
  //         }
  //         user.capabilities = capability;
  //       }

  //       prepareData = {
  //         userId: user.adminId,
  //         name: user.name,
  //         email: user.email,
  //         dialCode: user.dialCode,
  //         phoneNumber: user.phoneNumber,
  //         emailVerified: user.emailVerified,
  //         status: user.status,
  //         roleId: user.roleId,
  //         roleName: user.roleName,
  //         roleCode: user.roleCode,
  //         capabilities: user.capabilities,
  //       };
  //     }

  //     const isSuccess = Boolean(user);

  //     return this.customUtility.getResponseTemplate({
  //       success: isSuccess ? SUCCESS.true : SUCCESS.false,
  //       action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
  //       entity: this.entity,
  //       statusCode: isSuccess ? HttpStatus.UNAUTHORIZED : HttpStatus.NOT_FOUND,
  //       data: prepareData || {},
  //     });
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw new HttpException(
  //       MESSAGE.DEFAULT_MESSAGE(),
  //       HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }
}
