import {
  Controller,
  Get,
  Inject,
  Query,
  Param,
  LoggerService,
  HttpStatus,
  Post,
  Req,
  Body,
  Put,
  Delete,
  ParseIntPipe,
  HttpException,
} from '@nestjs/common';
import { Custom } from '@app/utilities/custom.utility';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  AutocompleteDto,
  ChangeStatus,
  ListDto,
} from '@app/common-config/dto/common.dto';
import _ from 'underscore';
import { RoleMasterService } from './admin-roles.service';
import { RoleDto, RoleCapabilityUpdateDto } from './dto/admin-role.dto';
import { GeneralUtility } from '@app/utilities/general.utility';
import { MESSAGE } from '@app/utilities/message';
import { ACTIONS } from '@app/utilities/action';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';
import {
  ICategory,
  IRoleAutoComplete,
  IRoleDetail,
  IRoleList,
  IRoleRecord,
} from '../../interfaces/role.interface';

@Controller('admin-role')
export class RoleMasterController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private roleMasterService: RoleMasterService,
    private customUtility: Custom,
    private generalUtility: GeneralUtility
  ) {}
  private entity = 'admin-role';

  // Role List
  @Post('list')
  async roleList(
    @Req() req,
    @Body() body: ListDto
  ): Promise<IApiResponse<IRoleList>> {
    try {
      const otherCondition = await this.generalUtility.getRoleCriteria(
        'list',
        req.user
      );

      const roleDetails = await this.roleMasterService.findAllRoles(
        body,
        otherCondition
      );
      const isSuccess: boolean = roleDetails && roleDetails.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? roleDetails : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Role Autocomplete
  @Get('autocomplete')
  async roleAutocomplete(
    @Query() body: AutocompleteDto,
    @Req() req
  ): Promise<IApiResponse<IRoleAutoComplete>> {
    try {
      const extraConfig = {
        table_name: 'roles',
        table_alias: 'r',
        primary_key: 'roleId',
      };

      const extraWhere = await this.generalUtility.getAutocompleteWhere(
        body,
        req.user,
        extraConfig
      );

      const roleResults = await this.roleMasterService.getRoleAutocomplete(
        extraWhere,
        body.keyword
      );

      const isSuccess = Boolean(
        roleResults && roleResults.length > SUCCESS.false
      );

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? roleResults : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Role Add
  @Post('add')
  async roleCreate(@Body() body: RoleDto): Promise<IApiResponse<IRoleRecord>> {
    try {
      const result = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        success: SUCCESS.false,
        data: {},
      };

      const roleCode = body.roleCode;

      const isRoleExists =
        await this.roleMasterService.getRoleCodeForAdd(roleCode);

      if (isRoleExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const addedRole = await this.roleMasterService.createRole(body);

        if (addedRole) {
          result.statusCode = HttpStatus.CREATED;
          result.success = SUCCESS.true;
          result.action = ACTIONS.ADDED;
          result.data = {
            roleId: addedRole.identifiers[0].roleId,
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

  // Role Update
  @Put(':id')
  async roleUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RoleDto
  ): Promise<IApiResponse<IRoleRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };

      const roleCode = body.roleCode;

      const roleDetails = await this.roleMasterService.getRoleData(id);

      if (roleDetails) {
        const isRoleExists = await this.roleMasterService.getRoleCodeForUpdate(
          roleCode,
          id
        );

        if (isRoleExists) {
          result.statusCode = HttpStatus.CONFLICT;
          result.action = ACTIONS.CODE_EXIST;
        } else {
          const canUpdate: boolean = await this.generalUtility.getRoleCriteria(
            'update',
            roleDetails,
            body
          );

          if (!canUpdate) {
            result.statusCode = HttpStatus.FORBIDDEN;
            result.action = ACTIONS.STATUS_GRP_CH_NOT_ALLOWED;
          } else {
            const updateRole = await this.roleMasterService.updateRole(
              body,
              'roleId',
              roleDetails.roleId
            );

            if (updateRole.affected) {
              result.success = SUCCESS.true;
              result.statusCode = HttpStatus.OK;
              result.action = ACTIONS.UPDATED;
              result.data = {
                roleId: id,
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

  // Role Delete
  @Delete(':id')
  async roleDelete(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_DELETED,
        data: {},
      };

      const roleDetails = await this.roleMasterService.getRoleData(id);

      if (roleDetails) {
        const deleteCondition: string = await this.generalUtility.getRoleCriteria(
          'delete',
          roleDetails
        );

        if (!!deleteCondition) {
          const deleteRole = await this.roleMasterService.deleteRole(
            id,
            deleteCondition
          );
          if (deleteRole.affected) {
            result.success = SUCCESS.true;
            result.statusCode = HttpStatus.OK;
            result.action = ACTIONS.DELETED;
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
      console.log(err)
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Role Change Status
  @Post('change-status')
  async roleChangeStatus(@Body() body: ChangeStatus): Promise<IApiResponse> {
    try {
      const roleChangeStatus = await this.roleMasterService.updateStatusRole(
        body.ids,
        body.status
      );

      const isSuccess = Boolean(roleChangeStatus.affected);

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

  // Role Capability List
  @Get('capability-list')
  async roleCapabilityList(): Promise<IApiResponse<ICategory[]>> {
    try {
      let capabilityCategory =
        await this.roleMasterService.getCapabilityCategory();

      if (capabilityCategory && capabilityCategory.length) {
        capabilityCategory = await Promise.all(
          capabilityCategory.map(async (item) => {
            const capabilities = await this.roleMasterService.getCapabilities(
              item.categoryId
            );
            if (capabilities) {
              item.capabilities.push(...capabilities);
            }
            return item;
          })
        );
      }

      const finalCapability = capabilityCategory;

      const isSuccess = Boolean(finalCapability.length);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.CAPS_LIST : ACTIONS.CAPS_NO_LIST,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: finalCapability || [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Role Capability Update
  @Put('capability-update/:id')
  async updateRoleCapability(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RoleCapabilityUpdateDto
  ): Promise<IApiResponse<IRoleRecord>> {
    try {
      const capabilities = body.capabilities;
      let capabilityList: any = '[]';
      if (_.isArray(capabilities)) {
        capabilityList = JSON.stringify(capabilities);
      } else if (capabilities) {
        capabilityList = capabilities;
      }

      if (capabilityList) {
        const updatedCapabilities =
          await this.roleMasterService.updateCapability(id, capabilityList);

        const isSuccess = Boolean(updatedCapabilities.affected);

        return this.customUtility.getResponseTemplate({
          success: isSuccess ? SUCCESS.true : SUCCESS.false,
          action: isSuccess ? ACTIONS.UPDATED : ACTIONS.NOT_UPDATED,
          data: { roleId: id } || {},
          statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
          entity: 'Role capabilities',
        });
      }
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Role Details
  @Get(':id')
  async roleDetails(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ): Promise<IApiResponse<IRoleDetail>> {
    try {
      const otherCondition = await this.generalUtility.getRoleCriteria(
        'details',
        req.user
      );

      const roleDetails = await this.roleMasterService.findOneRole(
        'roleId',
        id,
        otherCondition
      );
      const isSuccess = Boolean(roleDetails);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: roleDetails || {},
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
