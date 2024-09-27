import { Custom } from '@app/utilities/custom.utility';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  LoggerService,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { SystemEmailDto } from './dto/systemEmail.dto';
import { SystemEmailService } from './systemEmail.service';
import _ from 'underscore';
import {
  AutocompleteDto,
  ChangeStatus,
  ListDto,
} from '@app/common-config/dto/common.dto';
import { MESSAGE } from '@app/utilities/message';
import { ACTIONS } from '@app/utilities/action';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';
import {
  ISystemEmailAutoComplete,
  ISystemEmailDetail,
  ISystemEmailList,
  ISystemEmailRecord,
} from '../../interfaces/systemEmail.interface';

@Controller('tools')
export class SystemEmailController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private systemEmailService: SystemEmailService,
    private customUtility: Custom
  ) {}
  private entity = 'system email';

  // System Email List
  @Post('system-email-list')
  async systemEmailList(
    @Body() body: ListDto
  ): Promise<IApiResponse<ISystemEmailList>> {
    try {
      const templateList = await this.systemEmailService.allEmailTemplate(body);

      const isSuccess: boolean =
        templateList && templateList.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? templateList : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // System Email Details
  @Get('system-email/:id')
  async systemEmailDetail(
    @Param('id', ParseIntPipe) id
  ): Promise<IApiResponse<ISystemEmailDetail>> {
    try {
      const templateDetail = await this.systemEmailService.SystemEmailDetail(
        id,
        'emailTemplateId'
      );

      const isSuccess = Boolean(templateDetail);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: templateDetail || {},
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // System Email Add
  @Post('system-email')
  async systemEmailAdd(
    @Body() body: SystemEmailDto
  ): Promise<IApiResponse<ISystemEmailRecord>> {
    try {
      const result = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        success: SUCCESS.false,
        data: {},
      };
      const emailCode = body.emailCode;

      const isSystemEmailExists =
        await this.systemEmailService.getSystemEmailCodeForAdd(emailCode);

      if (isSystemEmailExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const systemEmail = await this.systemEmailService.createSystemEmail({
          ...body,
          variables: JSON.stringify(body.variables),
        });
        if (systemEmail) {
          result.statusCode = HttpStatus.CREATED;
          result.success = SUCCESS.true;
          result.action = ACTIONS.ADDED;
          result.data = {
            emailTemplateId: systemEmail.identifiers[0].emailTemplateId,
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

  // System Email Update
  @Put('system-email/:id')
  async updateSystemEmail(
    @Param('id', ParseIntPipe) id,
    @Body() body: SystemEmailDto
  ): Promise<IApiResponse<ISystemEmailRecord>> {
    try {
      const result = {
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        success: SUCCESS.false,
        data: {},
      };

      const isSystemEmailExists =
        await this.systemEmailService.checkSystemEmailExists(id);

      if (isSystemEmailExists) {
        const emailCode = body.emailCode;

        const getSystemEmailCodeForUpdate =
          await this.systemEmailService.getSystemEmailCodeForUpdate(
            emailCode,
            id
          );

        if (getSystemEmailCodeForUpdate) {
          result.statusCode = HttpStatus.CONFLICT;
          result.action = ACTIONS.CODE_EXIST;
        } else {
          const updateSystemEmail =
            await this.systemEmailService.updateSystemEmail(
              { ...body, variables: JSON.stringify(body.variables) },
              'emailTemplateId',
              id
            );
          if (updateSystemEmail && updateSystemEmail.affected > SUCCESS.false) {
            result.action = ACTIONS.UPDATED;
            result.statusCode = HttpStatus.OK;
            result.data = {
              pageId: id,
            };
            result.success = SUCCESS.true;
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

  // System Email Delete
  @Delete('system-email/:id')
  async systemEmailDelete(@Param('id') id: number): Promise<IApiResponse> {
    try {
      const deleteSystemEmail =
        await this.systemEmailService.deleteSystemEmail(id);
      const isSuccess = Boolean(deleteSystemEmail.affected);

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

  // System Email Autocomplete
  @Get('system-email-autocomplete')
  async systemEmailAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<ISystemEmailAutoComplete>> {
    try {
      // const conditions = [];

      // if (body.keyword) {
      //   conditions.push(`mse.emailTitle LIKE '%${body.keyword}%'`);
      // }

      // if (
      //   body.type &&
      //   (body.type === Status.Active || body.type === Status.Inactive)
      // ) {
      //   conditions.push(`mse.status IN ('${body.type}')`);
      // }

      // const where_cond =
      //   conditions.length > SUCCESS.false ? conditions.join(' AND ') : '';

      const emailData =
        await this.systemEmailService.systemEmailAutocomplete1(body);
      const isSuccess: boolean = emailData && emailData.length ? true : false;

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? emailData : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // System Email Change Status
  @Post('system-email-change-status')
  async systemEmailChangeStatus(
    @Body() body: ChangeStatus
  ): Promise<IApiResponse> {
    try {
      const systemEmailChangeStatus =
        await this.systemEmailService.systemEmailChangeStatus(
          body.ids,
          body.status
        );
      const isSuccess = Boolean(systemEmailChangeStatus.affected);

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
}
