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
import { CountryDto, GetCountryListDto } from './dto/country.dto';
import { CountryService } from './country.service';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';

import {
  ICountryAutoComplete,
  ICountryDetail,
  ICountryRecord,
} from '../../interfaces/country.interface';

@Controller('country')
export class CountryController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private countryService: CountryService,
    private customUtility: Custom
  ) {}
  private entity = 'country';

  // Country List
  @Post('list')
  async countryList(
    @Body() body: ListDto
  ): Promise<IApiResponse<ICountryDetail>> {
    try {
      const countryDetails = await this.countryService.findAllCountries(body);

      const isSuccess: boolean =
        countryDetails && countryDetails.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? countryDetails : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Country Add
  @Post()
  async create(
    @Body() body: CountryDto
  ): Promise<IApiResponse<ICountryRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };
      const countryCode = body.countryCode;

      const isCountryExists =
        await this.countryService.getCountryCodeForAdd(countryCode);
      if (isCountryExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const addCountry = await this.countryService.createCountry(body);

        if (addCountry) {
          result.success = SUCCESS.true;
          result.statusCode = HttpStatus.CREATED;
          result.action = ACTIONS.ADDED;
          result.data = {
            countryId: addCountry.identifiers[0].countryId,
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

  // Country Update
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CountryDto
  ): Promise<IApiResponse<ICountryRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };
      const countryCode = body.countryCode;

      const isCountryExists = await this.countryService.getCountryCodeForUpdate(
        countryCode,
        id
      );
      if (isCountryExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const updateCountry = await this.countryService.updateCountry(body, id);

        if (updateCountry && updateCountry.affected > SUCCESS.false) {
          result.success = SUCCESS.true;
          result.action = ACTIONS.UPDATED;
          result.data = {
            countryId: id,
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

  // Country Delete
  @Delete(':id')
  async countryDelete(@Param('id') id: number): Promise<IApiResponse> {
    try {
      const deleteCountry = await this.countryService.deleteCountry(id);

      const isSuccess = Boolean(deleteCountry.affected);

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

  // Country Autocomplete
  @Get('autocomplete')
  async countryAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<ICountryAutoComplete>> {
    try {
      const countryData = await this.countryService.countryAutocomplete(body);

      const isSuccess = Boolean(
        countryData && countryData.length > SUCCESS.false
      );

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        data: countryData || [],
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

  // Country Change Status
  @Post('change-status')
  async countryChangeStatus(@Body() body: ChangeStatus): Promise<IApiResponse> {
    try {
      const countryChangeStatus = await this.countryService.countryChangeStatus(
        body.ids,
        body.status
      );

      const isSuccess = Boolean(countryChangeStatus.affected);

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

  // Country Dial Codes
  @Get('dial-codes')
  async countryDialCodes(@Query() body) {
    try {
      let condition = "mc.status = 'Active' AND mc.dialCode IS NOT NULL";

      if (body.keyword) {
        const keywordWhere = `mc.dialCode LIKE '%${body.keyword}%' OR mc.country LIKE '%${body.keyword}%'`;
        condition = `${condition} AND (${keywordWhere})`;
      }

      const countryDialCodes =
        await this.countryService.getCountryDialCodes(condition);

      const isSuccess: boolean =
        countryDialCodes && countryDialCodes.length ? true : false;

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        data: countryDialCodes || [],
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

  // Get Country List
  @Get('countries')
  async getCountryList(
    @Query() queryParams: GetCountryListDto
  ): Promise<IApiResponse<ICountryAutoComplete>> {
    try {
      const getAllCountries =
        await this.countryService.getCountryList(queryParams);

      const isSuccess = Boolean(
        getAllCountries && getAllCountries.length > SUCCESS.false
      );

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? getAllCountries : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Country Details
  @Get(':id')
  async countryDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse<ICountryDetail>> {
    try {
      const getCountryDetails = await this.countryService.countryDetail(id);
      const isSuccess = Boolean(getCountryDetails);
      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: getCountryDetails || {},
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
