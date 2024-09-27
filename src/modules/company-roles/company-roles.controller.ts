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
import { RoleCapabilityDto, RoleDto } from './dto/company-role.dto';

import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  AutocompleteDto,
  ChangeStatus,
  ListDto,
} from '@app/common-config/dto/common.dto';
import _ from 'underscore';
import { GeneralUtility } from '@app/utilities/general.utility';
import { MESSAGE } from '@app/utilities/message';
import { ACTIONS } from '@app/utilities/action';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';
import {
  ICapability,
  ICategory,
  IRoleAutoComplete,
  IRoleDetail,
  IRoleList,
  IRoleRecord,
} from '../../interfaces/role.interface';
import { CompanyRolesService } from './company-roles.service';

@Controller('roles')
export class CompanyRolesController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private roleService: CompanyRolesService,
    private customUtility: Custom,
    private generalUtility: GeneralUtility
  ) {}
  private entity = 'company-role';

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

      const roleDetails = await this.roleService.findAllRoles(
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

      const roleResults = await this.roleService.getRoleAutocomplete(
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

      const roleCode = body.roleName.replace(/\s+/g, '').toLowerCase().trim();
      body.roleCode = roleCode;

      const isRoleExists = await this.roleService.getRoleCodeForAdd(roleCode);

      if (isRoleExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const addedRole = await this.roleService.createRole(body);

        if (Object.keys(addedRole).length) {
          result.statusCode = HttpStatus.CREATED;
          result.success = SUCCESS.true;
          result.action = ACTIONS.ADDED;
          result.data = addedRole;
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

  // Update Role Capability
  @Put('role-capability')
  async rolecapability(@Body() body: RoleCapabilityDto): Promise<IApiResponse> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };

      const updateRole = await this.roleService.updateRoleCapability(body);
      if (updateRole && updateRole.success) {
        result.success = SUCCESS.true;
        result.action = ACTIONS.UPDATED;
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

      const roleDetails = await this.roleService.getRoleData(id);

      if (roleDetails) {
        const deleteCondition: string =
          await this.generalUtility.getRoleCriteria('delete', roleDetails);

        if (!!deleteCondition) {
          const deleteRole = await this.roleService.deleteRole(
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
      const roleChangeStatus = await this.roleService.updateStatusRole(
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

  // Add Role Capability
  @Post('add-capability')
  async roleCapabilityCreate(
    @Body() body: RoleCapabilityDto
  ): Promise<IApiResponse> {
    try {
      let capabilityCategory = await this.roleService.getCapabilityCategory();

      if (capabilityCategory && capabilityCategory.length) {
        capabilityCategory = await Promise.all(
          capabilityCategory.map(async (item) => {
            const capabilities = await this.roleService.getCapabilities(
              item.categoryId
            );
            const groupedCapabilities: any = capabilities.reduce(
              (acc, { entityName, capabilityName, capabilityCode }) => {
                if (!acc[entityName]) {
                  acc[entityName] = [];
                }
                acc[entityName].push({ capabilityName, capabilityCode });
                return acc;
              },
              {}
            );

            if (capabilities) {
              item.capabilities.push(groupedCapabilities);
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

  // Role Capability List
  @Get('capability-list')
  async roleCapabilityList(): Promise<IApiResponse<ICategory[]>> {
    try {
      let capabilityCategory = await this.roleService.getCapabilityCategory();

      if (capabilityCategory && capabilityCategory.length) {
        capabilityCategory = await Promise.all(
          capabilityCategory.map(async (item) => {
            const capabilities = await this.roleService.getCapabilities(
              item.categoryId
            );
            const groupedCapabilities: any = capabilities.reduce(
              (acc, { entityName, capabilityName, capabilityCode }) => {
                if (!acc[entityName]) {
                  acc[entityName] = [];
                }
                acc[entityName].push({ capabilityName, capabilityCode });
                return acc;
              },
              {}
            );

            if (capabilities) {
              item.capabilities.push(groupedCapabilities);
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
  // @Put('capability-update/:id')
  // async updateRoleCapability(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() body: RoleCapabilityUpdateDto
  // ): Promise<IApiResponse<IRoleRecord>> {
  //   try {
  //     const capabilities = body.capabilities;
  //     let capabilityList: any = '[]';
  //     if (_.isArray(capabilities)) {
  //       capabilityList = JSON.stringify(capabilities);
  //     } else if (capabilities) {
  //       capabilityList = capabilities;
  //     }

  //     if (capabilityList) {
  //       const updatedCapabilities = await this.roleService.updateCapability(
  //         id,
  //         capabilityList
  //       );

  //       const isSuccess = Boolean(updatedCapabilities.affected);

  //       return this.customUtility.getResponseTemplate({
  //         success: isSuccess ? SUCCESS.true : SUCCESS.false,
  //         action: isSuccess ? ACTIONS.UPDATED : ACTIONS.NOT_UPDATED,
  //         data: { roleId: id } || {},
  //         statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
  //         entity: 'Role capabilities',
  //       });
  //     }
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw new HttpException(
  //       MESSAGE.DEFAULT_MESSAGE(),
  //       HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

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

      const roleDetails = await this.roleService.findOneRole(
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
