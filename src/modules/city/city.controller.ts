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
import { Custom } from '@app/utilities/custom.utility';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CityService } from './city.service';
import { ChangeStatus, ListDto } from '@app/common-config/dto/common.dto';

import { CityAutocompleteDto, CityDto } from './dto/city.dto';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';
import {
  ICityAutoComplete,
  ICityData,
  ICityList,
  ICityRecord,
} from '../../interfaces/city.interface';
import { MESSAGE } from '@app/utilities/message';
import { ACTIONS } from '@app/utilities/action';

@Controller('city')
export class CityController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private cityService: CityService,
    private customUtility: Custom
  ) {}
  private entity = 'city';

  // City List
  @Post('list')
  async cityList(@Body() body: ListDto): Promise<IApiResponse<ICityList>> {
    try {
      const cityDetails = await this.cityService.findAllCitys(body);

      const isSuccess: boolean = cityDetails && cityDetails.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? cityDetails : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // City Add
  @Post('add')
  async createCity(@Body() body: CityDto): Promise<IApiResponse<ICityRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        entity: this.entity,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };

      const cityCode = body.cityCode;
      const stateId = body.stateId;
      const countryId = body.countryId;

      const isStateExists = await this.cityService.getCityStateForAdd(
        stateId,
        countryId
      );
      if (isStateExists) {
        const isCityCodeExists = await this.cityService.getCityCodeForAdd(
          cityCode,
          countryId,
          stateId
        );

        if (isCityCodeExists) {
          result.statusCode = HttpStatus.CONFLICT;
          result.action = ACTIONS.CODE_EXIST;
        } else {
          const addCity = await this.cityService.createCity(body);

          if (addCity) {
            result.success = SUCCESS.true;
            result.statusCode = HttpStatus.CREATED;
            result.action = ACTIONS.ADDED;
            result.data = {
              cityId: addCity.identifiers[0].cityId,
            };
          }
        }
      } else {
        result.entity = 'state';
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

  // City Update
  @Put(':id')
  async updateCity(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CityDto
  ): Promise<IApiResponse<ICityRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        entity: this.entity,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };
      const cityCode = body.cityCode;
      const stateId = body.stateId;
      const countryId = body.countryId;

      const isStateExists = await this.cityService.getCityStateForUpdate(
        countryId,
        stateId
      );
      if (isStateExists) {
        const isCityCodeExists = await this.cityService.getCityCodeForUpdate(
          cityCode,
          countryId,
          stateId,
          id
        );

        if (isCityCodeExists) {
          result.statusCode = HttpStatus.CONFLICT;
          result.action = ACTIONS.CODE_EXIST;
        } else {
          const updateCity = await this.cityService.updateCity(body, id);

          if (updateCity && updateCity.affected > SUCCESS.false) {
            result.success = SUCCESS.true;
            result.action = ACTIONS.UPDATED;
            result.data = {
              cityId: id,
            };
            result.statusCode = HttpStatus.OK;
          }
        }
      } else {
        result.entity = 'state';
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

  // City Delete
  @Delete(':id')
  async cityDelete(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse> {
    try {
      const deleteCity = await this.cityService.deleteCity(id);

      const isSuccess = Boolean(deleteCity.affected);

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

  // City Autocomplete
  @Get('autocomplete')
  async cityAutocomplete(
    @Query() body: CityAutocompleteDto
  ): Promise<IApiResponse<ICityAutoComplete>> {
    try {
      const cityData = await this.cityService.cityAutocomplete(body);

      const isSuccess = Boolean(cityData && cityData.length > SUCCESS.false);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? cityData : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // City Change Status
  @Post('change-status')
  async cityChangeStatus(@Body() body: ChangeStatus): Promise<IApiResponse> {
    try {
      const cityChangeStatus = await this.cityService.cityChangeStatus(
        body.ids,
        body.status
      );
      const isSuccess = Boolean(cityChangeStatus.affected);

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

  // City Details
  @Get(':id')
  async cityDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse<ICityData>> {
    try {
      const getCityDetails = await this.cityService.cityDetail(id);

      const isSuccess = Boolean(getCityDetails);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: getCityDetails || {},
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
