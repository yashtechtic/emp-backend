import {
  Controller,
  Get,
  Inject,
  Query,
  Param,
  LoggerService,
  HttpStatus,
  Post,
  Body,
  Put,
  Delete,
  ParseIntPipe,
  HttpException,
} from '@nestjs/common';
import { Custom } from '@app/utilities/custom.utility';

import { ACTIONS } from '@app/utilities/action';
import { MESSAGE } from '@app/utilities/message';

import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  AutocompleteDto,
  ChangeStatus,
  ListDto,
} from '@app/common-config/dto/common.dto';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';

import {
  IGroupAutoComplete,
  IGroupDetail,
  IGroupRecord,
} from '../../interfaces/companies/group-user.interface';
import { UserGroupService } from './user-group.service';
import { GroupDto, UpdateGroupDto } from './dto/user-group.dto';

@Controller('user-group')
export class UserGroupController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private groupService: UserGroupService,
    private customUtility: Custom
  ) {}
  private entity = 'group';

  // group List
  @Post('list')
  async groupList(@Body() body: ListDto): Promise<IApiResponse<IGroupDetail>> {
    try {
      const groupDetails = await this.groupService.findAllGroups(body);

      if (groupDetails && groupDetails.data && groupDetails.data.length > 0) {
        const groupUser = [];
        groupDetails.data.forEach((group) => {
          groupUser.push(group.groupId);
        });

        const getGroupUsers: any = await this.groupService.groupUserDetail(
          groupUser,
          ''
        );

        groupDetails.data.forEach((group) => {
          const usersForGroup = getGroupUsers.filter(
            (user) => user.groupId === group.groupId
          );
          group.groupUsers = usersForGroup;
        });
      }

      const isSuccess: boolean =
        groupDetails && groupDetails.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? groupDetails : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Group Add
  @Post('add')
  async create(@Body() body: GroupDto): Promise<IApiResponse<IGroupRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };

      const groupCode = this.groupService.getGroupCode(body.groupName);
      const isGroupExists =
        await this.groupService.getGroupCodeForAdd(groupCode);
      if (isGroupExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.GROUP_EXIST;
      } else {
        body.groupCode = groupCode;
        if (body.isNormalGroup == undefined) {
          body.isNormalGroup = true;
        }
        const addGroup: any = await this.groupService.createGroup(body);

        if (addGroup) {
          result.success = SUCCESS.true;
          result.statusCode = HttpStatus.CREATED;
          result.action = ACTIONS.ADDED;
          if (body.isNormalGroup) {
            result.data = {
              groupId: addGroup.identifiers[0].groupId,
            };
          } else {
            result.data = {
              users: addGroup.users,
            };
          }
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

  // Group Update
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateGroupDto
  ): Promise<IApiResponse<IGroupRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };

      const updateGroup = await this.groupService.updateGroup(body, id);
      if (updateGroup && updateGroup.affected > SUCCESS.false) {
        result.success = SUCCESS.true;
        result.action = ACTIONS.UPDATED;
        result.data = {
          groupId: id,
        };
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

  // group Delete
  @Delete(':id')
  async groupDelete(@Param('id') id: number): Promise<IApiResponse> {
    try {
      const deletegroup = await this.groupService.deleteGroup(id);

      const isSuccess = Boolean(deletegroup.affected);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        action: isSuccess ? ACTIONS.DELETED : ACTIONS.NOT_DELETED,
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

  // Group Autocomplete
  @Get('autocomplete')
  async groupAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<IGroupAutoComplete>> {
    try {
      const groupData = await this.groupService.groupAutocomplete(body);

      const isSuccess = Boolean(groupData && groupData.length > SUCCESS.false);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        data: groupData || [],
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
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

  // Group Change Status
  @Post('change-status')
  async groupChangeStatus(@Body() body: ChangeStatus): Promise<IApiResponse> {
    try {
      const groupChangeStatus = await this.groupService.groupChangeStatus(
        body.ids,
        body.status
      );

      const isSuccess = Boolean(groupChangeStatus.affected);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
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

  // Group Details
  @Get(':id')
  async groupDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse<IGroupDetail>> {
    try {
      const getGroupDetails = await this.groupService.groupDetail(id);
      const getGroupUsers: any = await this.groupService.groupUserDetail(
        [id],
        ''
      );

      const getGroupRoles: any = await this.groupService.groupRoles([id], '');

      getGroupDetails.groupUsers = getGroupUsers || [];
      getGroupDetails.roles = getGroupRoles || [];

      const isSuccess = Boolean(getGroupDetails);
      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: getGroupDetails || {},
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
