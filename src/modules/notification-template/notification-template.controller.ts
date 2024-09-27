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
  INotificationTemplateAutoComplete,
  INotificationTemplateDetail,
  INotificationTemplateRecord,
} from '../../interfaces/notification-template.interface';
import { NotificationTemplatesService } from './notification-template.service';
import { NotificationTemplateDto } from './dto/notification-template.dto';

@Controller('notification-template')
export class NotificationTemplatesController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private notificationTemplateService: NotificationTemplatesService,
    private customUtility: Custom
  ) {}
  private entity = 'Notification Template';

  // Notification Template List
  @Post('list')
  async notificationTemplateList(
    @Body() body: ListDto
  ): Promise<IApiResponse<INotificationTemplateDetail>> {
    try {
      const notificationTemplateList =
        await this.notificationTemplateService.findAllNotificationTemplates(
          body
        );

      const isSuccess: boolean =
        notificationTemplateList && notificationTemplateList.data
          ? true
          : false;

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? notificationTemplateList : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Notification Template Add
  @Post('add')
  async create(
    @Body() body: NotificationTemplateDto
  ): Promise<IApiResponse<INotificationTemplateRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };
      const title = body.templateName;

      const isNotificationTemplateExists =
        await this.notificationTemplateService.getTemplateNameForAdd(title);
      if (isNotificationTemplateExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const addNotificationTemplate =
          await this.notificationTemplateService.createNotificationTemplate(
            body
          );

        if (addNotificationTemplate) {
          result.success = SUCCESS.true;
          result.statusCode = HttpStatus.CREATED;
          result.action = ACTIONS.ADDED;
          result.data = {
            NotificationTemplateId:
              addNotificationTemplate.identifiers[0].notificationTemplateId,
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

  // Notification Template Update
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: NotificationTemplateDto
  ): Promise<IApiResponse<INotificationTemplateRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };
      const title = body.templateName;

      const isNotificationTemplateExists =
        await this.notificationTemplateService.getTemplateNameForUpdate(
          title,
          id
        );
      if (isNotificationTemplateExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const updateNotificationTemplate =
          await this.notificationTemplateService.updateNotificationTemplate(
            body,
            id
          );

        if (
          updateNotificationTemplate &&
          updateNotificationTemplate.affected > SUCCESS.false
        ) {
          result.success = SUCCESS.true;
          result.action = ACTIONS.UPDATED;
          result.data = {
            notificationTemplateId: id,
          };
          result.statusCode = HttpStatus.OK;
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

  // Notification Template Delete
  @Delete(':id')
  async notificationTemplateDelete(
    @Param('id') id: number
  ): Promise<IApiResponse> {
    try {
      const deleteNotificationTemplate =
        await this.notificationTemplateService.deleteNotificationTemplate(id);

      const isSuccess = Boolean(deleteNotificationTemplate.affected);

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

  // Notification Template Autocomplete
  @Get('autocomplete')
  async notificationTemplateAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<INotificationTemplateAutoComplete>> {
    try {
      const notificationTemplateData =
        await this.notificationTemplateService.notificationTemplateAutocomplete(
          body
        );

      const isSuccess = Boolean(
        notificationTemplateData &&
          notificationTemplateData.length > SUCCESS.false
      );

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        data: notificationTemplateData || [],
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

  // Notification Template Change Status
  @Post('change-status')
  async notificationTemplateChangeStatus(
    @Body() body: ChangeStatus
  ): Promise<IApiResponse> {
    try {
      const notificationTemplateChangeStatus =
        await this.notificationTemplateService.notificationTemplateChangeStatus(
          body.ids,
          body.status
        );

      const isSuccess = Boolean(notificationTemplateChangeStatus.affected);

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

  // Notification Template Details
  @Get(':id')
  async notificationTemplateDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse<INotificationTemplateDetail>> {
    try {
      const getNotificationTemplateDetails =
        await this.notificationTemplateService.notificationTemplateDetail(id);
      const isSuccess = Boolean(getNotificationTemplateDetails);
      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: getNotificationTemplateDetails || {},
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
