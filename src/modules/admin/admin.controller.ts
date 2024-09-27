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

import { CheckAdminEmailDto, UserDto } from './dto/admin.dto';
import {
  AutocompleteDto,
  ChangeStatus,
  ListDto,
} from '@app/common-config/dto/common.dto';
import { addSeconds } from 'date-fns';
import { AdminService } from './admin.service';

import { SettingsService } from '@app/services/services/settings.service';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';
import {
  IAdminAutocomplete,
  IAdminData,
  IAdminList,
  IAdminRecord,
} from '../../interfaces/admin.interface';

import { ACTIONS } from '@app/utilities/action';
import { MESSAGE } from '@app/utilities/message';

import { ListUtility } from '@app/utilities/list.utility';
import { GeneralUtility } from '@app/utilities/general.utility';
import { CommonConfigService } from '@app/common-config/common-config.service';

@Controller('admin')
export class AdminController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private adminService: AdminService,
    private customUtility: Custom,
    private listUtility: ListUtility,
    private generalUtility: GeneralUtility,
    private settings: SettingsService,
    private commonService: CommonConfigService
  ) {}
  private entity = 'Admin';

  // Admin List
  @Post('list')
  async adminList(
    @Req() req,
    @Body() body: ListDto
  ): Promise<IApiResponse<IAdminList>> {
    try {
      const adminListCond = await this.generalUtility.getAdminCriteria(
        'list',
        req.user
      );

      const userDetails = await this.adminService.findAllUsers(
        body,
        adminListCond
      );
      userDetails.data = await this.commonService.getImageUrl(
        userDetails.data,
        'admin_image'
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

  // Admin Autocomplete
  @Get('autocomplete')
  async adminAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<IAdminAutocomplete>> {
    try {
      const extraConfig = {
        table_name: 'admins',
        table_alias: 'ma',
        primary_key: 'adminId',
      };
      // const extraWhere = await this.generalUtility.getAutocompleteWhere(
      //   body,
      //   req.user,
      //   extraConfig
      // );

      const extraWhere = '';
      const adminResults = await this.adminService.getAdminAutocomplete(
        extraWhere,
        body.keyword
      );

      const isSuccess = Boolean(
        adminResults && adminResults.length > SUCCESS.false
      );

      return this.customUtility.getResponseTemplate({
        success: 1,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? adminResults : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Admin Details
  @Get(':id')
  async adminDetails(
    @Param('id') id,
    @Req() req: any
  ): Promise<IApiResponse<IAdminData>> {
    try {
      const whereCond = await this.generalUtility.getAdminCriteria(
        'details',
        req.user
      );

      let adminDetails = await this.adminService.findOneUser(
        id,
        'adminId',
        whereCond
      );

      adminDetails = await this.commonService.getImageUrl(
        adminDetails,
        'admin_image'
      );

      const isSuccess = Boolean(adminDetails);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: adminDetails || {},
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  //Admin Add
  @Post('add')
  async adminCreate(
    @Body() body: UserDto
  ): Promise<IApiResponse<IAdminRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };
      const userDetails = await this.adminService.checkAdminEmail(body.email);
      if (userDetails) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.EMAIL_EXIST;
      } else {
        const resetCode = this.generalUtility.generateOTPCode();

        const expirySeconds = await this.settings.getItem('OTP_EXPIRY_SECONDS');
        console.log('expirySeconds', expirySeconds);

        const expiryTime = addSeconds(new Date(), expirySeconds);

        const tokenInfo = {
          email: body.email.toLowerCase(),
          code: resetCode,
          pass: 1,
          exp: expiryTime,
        };

        const encToken =
          await this.generalUtility.encryptVerifyToken(tokenInfo);

        const verifyLink = `${await this.settings.getItem(
          'admin_url'
        )}/verify-email/${encToken}`;

        const prepareData = {
          ...body,
          timezoneId: body.timeZone,
          otpCode: resetCode,
          otpExpiryTime: expiryTime,
          userName: `${body.firstName} ${body.lastName}`,
        };

        const uploadInfo = await this.commonService.processAndValidateFile(
          body.image
        );

        if ('name' in uploadInfo) {
          body.image = uploadInfo.name;
        }

        const addedUser = await this.adminService.createUser(prepareData);
        if (addedUser) {
          uploadInfo.folderName = 'admin_image/';
          this.commonService.uploadFolderImage(uploadInfo);
          result.success = 1;
          result.statusCode = HttpStatus.CREATED;
          result.action = ACTIONS.ADDED;
          result.data = {
            adminId: addedUser.identifiers[0].adminId,
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

  // Admin Update
  @Put(':id')
  async adminUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UserDto
  ): Promise<IApiResponse<IAdminRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };

      const userData = await this.adminService.checkAdminExists(id);

      if (userData) {
        const getAdminEmailForUpdate = await this.adminService.checkAdminEmail(
          body.email,
          id
        );
        if (getAdminEmailForUpdate) {
          result.statusCode = HttpStatus.CONFLICT;
          result.action = ACTIONS.EMAIL_EXIST;
        } else {
          const userDetails = await this.adminService.findOneUser(
            id,
            'adminId'
          );
          const canUpdate: boolean = await this.generalUtility.getAdminCriteria(
            'update',
            userDetails,
            body
          );

          if (!canUpdate) {
            result.statusCode = HttpStatus.FORBIDDEN;
            result.action = ACTIONS.STATUS_GRP_CH_NOT_ALLOWED;
          } else {
            const updateUser = await this.adminService.updateAdmin(
              body,
              'adminId',
              userDetails.adminId
            );

            if (updateUser.affected) {
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

  // Admin Delete
  @Delete(':id')
  async adminDelete(@Param('id') id: number): Promise<IApiResponse> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_DELETED,
        data: {},
      };

      const userDetails = await this.adminService.findOneUser(id, 'adminId');

      if (userDetails) {
        const whereCond: string = await this.generalUtility.getAdminCriteria(
          'delete',
          userDetails
        );

        if (!!whereCond) {
          const deleteUser = await this.adminService.deleteAdmin(id, whereCond);

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

  // Admin Change Status
  @Post('change-status')
  async adminChangeStatus(@Body() body: ChangeStatus): Promise<IApiResponse> {
    try {
      const userChangeStatus = await this.adminService.updateStatusUser(
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

  // Check Admin Email
  @Post('admin-email')
  async checkAdminEmail(
    @Body() body: CheckAdminEmailDto
  ): Promise<IApiResponse> {
    try {
      const checkEmail = await this.adminService.checkAdminEmail(
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

  // Admin Identity
  @Get('identity')
  async getUserIdentity(@Req() req): Promise<IApiResponse<IAdminData>> {
    try {
      let prepareData = {};

      const { adminId, roleId } = req.user;
      const user = await this.adminService.adminIdentity(adminId, roleId);

      if (user) {
        // Get restricted admin identity
        const restrictAdminGroups = await this.settings.getItem(
          'restrict_admin_groups'
        );

        const { roleCode } = user;
        if (restrictAdminGroups && restrictAdminGroups.includes(roleCode)) {
          const getGroupCapabitilty = await this.adminService.getCapabilities();

          const capability = [];
          if (getGroupCapabitilty && getGroupCapabitilty.length) {
            getGroupCapabitilty.forEach((ele) => {
              capability.push(ele.capabilityCode);
            });
          }
          user.capabilities = capability;
        }

        prepareData = {
          userId: user.adminId,
          name: user.name,
          email: user.email,
          dialCode: user.dialCode,
          phoneNumber: user.phoneNumber,
          emailVerified: user.emailVerified,
          status: user.status,
          roleId: user.roleId,
          roleName: user.roleName,
          roleCode: user.roleCode,
          capabilities: user.capabilities,
        };
      }

      const isSuccess = Boolean(user);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.UNAUTHORIZED : HttpStatus.NOT_FOUND,
        data: prepareData || {},
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
