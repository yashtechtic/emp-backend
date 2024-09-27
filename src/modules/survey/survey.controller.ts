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
  ISurveyAutoComplete,
  ISurveyDetail,
  ISurveyRecord,
} from '../../interfaces/survey.interface';
import { SurveyService } from './survey.service';
import { SurveyDto } from './dto/survey.dto';

@Controller('survey')
export class SurveyController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private surveyService: SurveyService,
    private customUtility: Custom
  ) {}
  private entity = 'Survey';

  // Survey List
  @Post('list')
  async surveyList(
    @Body() body: ListDto
  ): Promise<IApiResponse<ISurveyDetail>> {
    try {
      const surveyDetails = await this.surveyService.findAllSurveys(body);

      const isSuccess: boolean =
        surveyDetails && surveyDetails.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? surveyDetails : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Survey Add
  @Post('add')
  async create(
    @Body() body: SurveyDto,
    @Req() req: any
  ): Promise<IApiResponse<ISurveyRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };

      body.addedBy = req.user.userId;
      const addSurvey = await this.surveyService.createSurvey(body);

      if (addSurvey) {
        result.success = SUCCESS.true;
        result.statusCode = HttpStatus.CREATED;
        result.action = ACTIONS.ADDED;
        result.data = {
          surveyId: addSurvey.identifiers[0].surveyId,
        };
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

  // Survey Update
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SurveyDto
  ): Promise<IApiResponse<ISurveyRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };

      const updateSurvey = await this.surveyService.updateSurvey(body, id);

      if (updateSurvey && updateSurvey.affected > SUCCESS.false) {
        result.success = SUCCESS.true;
        result.action = ACTIONS.UPDATED;
        result.data = {
          surveyId: id,
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

  // Survey Delete
  @Delete(':id')
  async surveyDelete(@Param('id') id: number): Promise<IApiResponse> {
    try {
      const deleteSurvey = await this.surveyService.deleteSurvey(id);

      const isSuccess = Boolean(deleteSurvey.affected);

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

  // Survey Autocomplete
  @Get('autocomplete')
  async surveyAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<ISurveyAutoComplete>> {
    try {
      const surveyData = await this.surveyService.surveyAutocomplete(body);

      const isSuccess = Boolean(
        surveyData && surveyData.length > SUCCESS.false
      );

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        data: surveyData || [],
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

  // Survey Change Status
  @Post('change-status')
  async surveyChangeStatus(@Body() body: ChangeStatus): Promise<IApiResponse> {
    try {
      const surveyChangeStatus = await this.surveyService.changeSurveyStatus(
        body.ids,
        body.status
      );

      const isSuccess = Boolean(surveyChangeStatus.affected);

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

  // Survey Details
  @Get(':id')
  async surveyDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse<ISurveyDetail>> {
    try {
      const getSurveyDetails = await this.surveyService.surveyDetail(id);

      const isSuccess = Boolean(getSurveyDetails);
      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: getSurveyDetails || {},
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
