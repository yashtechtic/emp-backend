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
import { ChangeStatus, Status } from '@app/common-config/dto/common.dto';
import { Custom } from '@app/utilities/custom.utility';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  StateDto,
  ListDto,
  AutocompleteDto,
  GetStateListDto,
} from './dto/state.dto';
import _ from 'underscore';
import { StateService } from './state.service';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';
import {
  IStateAutoComplete,
  IStateData,
  IStateList,
  IStateRecord,
} from '../../interfaces/state.interface';
import { MESSAGE } from '@app/utilities/message';
import { ACTIONS } from '@app/utilities/action';

@Controller('state')
export class StateController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private stateService: StateService,
    private customUtility: Custom
  ) {}
  private entity = 'state';

  // State List
  @Post('list')
  async stateList(@Body() body: ListDto): Promise<IApiResponse<IStateList>> {
    try {
      const stateDetails = await this.stateService.findAllStates(body);
      const isSuccess: boolean =
        stateDetails && stateDetails.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? stateDetails : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // State Add
  @Post('add')
  async createState(
    @Body() body: StateDto
  ): Promise<IApiResponse<IStateRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        entity: this.entity,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };
      const stateCode = body.stateCode;
      const countryId = body.countryId;

      const isCountryExists =
        await this.stateService.getStateCountryForAdd(countryId);
      if (isCountryExists) {
        const isStateCodeExists = await this.stateService.getStateCodeForAdd(
          stateCode,
          countryId
        );

        if (isStateCodeExists) {
          result.statusCode = HttpStatus.CONFLICT;
          result.action = ACTIONS.CODE_EXIST;
        } else {
          const addState = await this.stateService.createState(body);

          if (addState) {
            result.success = SUCCESS.true;
            result.statusCode = HttpStatus.CREATED;
            result.action = ACTIONS.ADDED;
            result.data = {
              stateId: addState.identifiers[0].stateId,
            };
          }
        }
      } else {
        result.entity = 'country';
        result.statusCode = HttpStatus.BAD_REQUEST;
        result.action = ACTIONS.NOT_EXIST;
      }
      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: result.entity,
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

  // State update
  @Put(':id')
  async updateState(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: StateDto
  ): Promise<IApiResponse<IStateRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        entity: this.entity,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };
      const stateCode = body.stateCode;
      const countryId = body.countryId;

      const isCountryExists =
        await this.stateService.getStateCountryForUpdate(countryId);
      if (isCountryExists) {
        const isStateCodeExists = await this.stateService.getStateCodeForUpdate(
          stateCode,
          id,
          countryId
        );

        if (isStateCodeExists) {
          result.statusCode = HttpStatus.CONFLICT;
          result.action = ACTIONS.CODE_EXIST;
        } else {
          const updateState = await this.stateService.updateState(
            body,
            'stateId',
            id
          );

          if (updateState && updateState.affected > SUCCESS.false) {
            result.success = SUCCESS.true;
            result.action = ACTIONS.UPDATED;
            result.data = {
              stateId: id,
            };
            result.statusCode = HttpStatus.OK;
          }
        }
      } else {
        result.entity = 'country';
        result.statusCode = HttpStatus.BAD_REQUEST;
        result.action = ACTIONS.NOT_EXIST;
      }
      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: result.entity,
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

  // State Delete
  @Delete(':id')
  async stateDelete(@Param('id') id: number): Promise<IApiResponse> {
    try {
      const deleteState = await this.stateService.deleteState(id);
      return this.customUtility.getResponseTemplate({
        success: deleteState.affected ? SUCCESS.true : SUCCESS.false,
        statusCode: deleteState.affected ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        action: deleteState.affected ? ACTIONS.DELETED : ACTIONS.NOT_DELETED,
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

  // State autocomplete
  @Get('autocomplete')
  async stateAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<IStateAutoComplete>> {
    try {
      const conditions = [];

      if (body.keyword) {
        conditions.push(`ms.state LIKE '%${body.keyword}%'`);
      }
      if (body.countryId) {
        conditions.push(`ms.countryId = ${body.countryId}`);
      }

      if (
        body.type &&
        (body.type === Status.Active || body.type === Status.Inactive)
      ) {
        conditions.push(`ms.status IN ('${body.type}')`);
      }

      const where_cond =
        conditions.length > SUCCESS.false ? conditions.join(' AND ') : '';

      const stateData = await this.stateService.stateAutocomplete(where_cond);

      const isSuccess = Boolean(stateData && stateData.length > SUCCESS.false);

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? stateData : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // State change status
  @Post('change-status')
  async stateChangeStatus(@Body() body: ChangeStatus): Promise<IApiResponse> {
    try {
      const stateChangeStatus = await this.stateService.stateChangeStatus(
        body.ids,
        body.status
      );

      const isSuccess = Boolean(stateChangeStatus.affected);

      return this.customUtility.getResponseTemplate({
        success:
          stateChangeStatus && stateChangeStatus.affected
            ? SUCCESS.true
            : SUCCESS.false,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,

        action: stateChangeStatus.affected
          ? ACTIONS.CHANGE_STATUS
          : ACTIONS.STATUS_NOT_CHANGE,
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Get State List
  @Get('country-states-list')
  async getAllStates(
    @Query() queryParams: GetStateListDto
  ): Promise<IApiResponse<IStateAutoComplete>> {
    try {
      const stateData = await this.stateService.getAllStates(queryParams);

      const isSuccess = Boolean(stateData && stateData.length > SUCCESS.false);

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? stateData : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // State Details
  @Get(':id')
  async stateDetail(
    @Param('id', ParseIntPipe) id: number | string
  ): Promise<IApiResponse<IStateData>> {
    try {
      const getStateDetails = await this.stateService.stateDetail(
        id,
        'stateId'
      );

      const isSuccess = Boolean(getStateDetails);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: getStateDetails || {},
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
