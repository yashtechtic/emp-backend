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
  Req,
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
  IPhishingTemplateAutoComplete,
  IPhishingTemplateDetail,
  IPhishingTemplateRecord,
} from '../../interfaces/phising-template.interface';
import { PhishingTemplatesService } from './phishing-template.service';
import { PhishingTemplateDto } from './dto/phishing-template.dto';

@Controller('phishing-template')
export class PhishingTemplatesController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private phishingTemplateService: PhishingTemplatesService,
    private customUtility: Custom
  ) {}
  private entity = 'Phishing Template';

  @Post('list')
  async phishingTemplateList(
    @Body() body: ListDto
  ): Promise<IApiResponse<IPhishingTemplateDetail>> {
    try {
      const phishingTemplateList =
        await this.phishingTemplateService.findAllPhishingTemplates(body);

      const isSuccess: boolean =
        phishingTemplateList && phishingTemplateList.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? phishingTemplateList : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('add')
  async create(
    @Body() body: PhishingTemplateDto,
    @Req() req: any
  ): Promise<IApiResponse<IPhishingTemplateRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.OK,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };

      const isPhishingTemplateExists =
        await this.phishingTemplateService.getTemplateNameForAdd(
          body.templateName
        );
      if (isPhishingTemplateExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        body.addedBy = req.user.userId;
        body.updatedBy = req.user.userId;
        const addPhishingTemplate =
          await this.phishingTemplateService.createPhishingTemplate(body);

        if (addPhishingTemplate) {
          result.success = SUCCESS.true;
          result.statusCode = HttpStatus.CREATED;
          result.action = ACTIONS.ADDED;
          result.data = {
            PhishingTemplateId:
              addPhishingTemplate.identifiers[0].phishingTemplateId,
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

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PhishingTemplateDto,
    @Req() req: any
  ): Promise<IApiResponse<IPhishingTemplateRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };
      const title = body.templateName;

      const isPhishingTemplateExists =
        await this.phishingTemplateService.getTemplateNameForUpdate(title, id);
      console.log(isPhishingTemplateExists);
      if (isPhishingTemplateExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        body.addedBy = req.user.userId;
        body.updatedBy = req.user.userId;
        const updatePhishingTemplate =
          await this.phishingTemplateService.updatePhishingTemplate(body, id);

        if (
          updatePhishingTemplate &&
          updatePhishingTemplate.affected > SUCCESS.false
        ) {
          result.success = SUCCESS.true;
          result.action = ACTIONS.UPDATED;
          result.data = {
            phishingTemplateId: id,
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

  @Delete(':id')
  async phishingTemplateDelete(@Param('id') id: number): Promise<IApiResponse> {
    try {
      const deletePhishingTemplate =
        await this.phishingTemplateService.deletePhishingTemplate(id);

      const isSuccess = Boolean(deletePhishingTemplate.affected);

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

  @Get('autocomplete')
  async phishingTemplateAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<IPhishingTemplateAutoComplete>> {
    try {
      const phishingTemplateData =
        await this.phishingTemplateService.phishingTemplateAutocomplete(body);

      const isSuccess = Boolean(
        phishingTemplateData && phishingTemplateData.length > SUCCESS.false
      );

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        data: phishingTemplateData || [],
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

  @Post('change-status')
  async phishingTemplateChangeStatus(
    @Body() body: ChangeStatus
  ): Promise<IApiResponse> {
    try {
      const phishingTemplateChangeStatus =
        await this.phishingTemplateService.phishingTemplateChangeStatus(
          body.ids,
          body.status
        );

      const isSuccess = Boolean(phishingTemplateChangeStatus.affected);

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

  @Get(':id')
  async PhishingTemplateDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse<IPhishingTemplateDetail>> {
    try {
      const getPhishingTemplateDetails =
        await this.phishingTemplateService.phishingTemplateDetail(id);
      const isSuccess = Boolean(getPhishingTemplateDetails);
      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: getPhishingTemplateDetails || {},
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
