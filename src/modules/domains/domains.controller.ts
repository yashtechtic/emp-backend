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
  IDomainAutoComplete,
  IDomainDetail,
  IDomainRecord,
  IRootDomainAutoComplete,
} from '../../interfaces/domain.interface';
import { DomainsService } from './domains.service';
import { DomainDto } from './dto/domain.dto';

@Controller('domain')
export class DomainsController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private domainService: DomainsService,
    private customUtility: Custom
  ) {}
  private entity = 'Domain';

  // Domain List
  @Post('list')
  async domainList(
    @Body() body: ListDto
  ): Promise<IApiResponse<IDomainDetail>> {
    try {
      const domainList = await this.domainService.findAllDomains(body);

      const isSuccess: boolean = domainList && domainList.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? domainList : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Domain Add
  @Post('add')
  async create(@Body() body: DomainDto): Promise<IApiResponse<IDomainRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };
      const domainUrl = body.domainUrl;

      const isDomainExists =
        await this.domainService.getDomainUrlForAdd(domainUrl);
      if (isDomainExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const addDomain = await this.domainService.createDomain(body);

        if (addDomain) {
          result.success = SUCCESS.true;
          result.statusCode = HttpStatus.CREATED;
          result.action = ACTIONS.ADDED;
          result.data = {
            domainId: addDomain.identifiers[0].domainId,
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

  // Domain Update
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: DomainDto
  ): Promise<IApiResponse<IDomainRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };
      const domainUrl = body.domainUrl;

      const isDomainExists = await this.domainService.getDomainUrlForUpdate(
        domainUrl,
        id
      );
      if (isDomainExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const updateDomain = await this.domainService.updateDomain(body, id);

        if (updateDomain && updateDomain.affected > SUCCESS.false) {
          result.success = SUCCESS.true;
          result.action = ACTIONS.UPDATED;
          result.data = {
            domainId: id,
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

  // Domain Delete
  @Delete(':id')
  async domainDelete(@Param('id') id: number): Promise<IApiResponse> {
    try {
      const deleteDomain = await this.domainService.deleteDomain(id);

      const isSuccess = Boolean(deleteDomain.affected);

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

  // Domain Autocomplete
  @Get('autocomplete')
  async domainAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<IDomainAutoComplete>> {
    try {
      const domainData = await this.domainService.domainAutocomplete(body);

      const isSuccess = Boolean(
        domainData && domainData.length > SUCCESS.false
      );

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        data: domainData || [],
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

  // Domain Change Status
  @Post('change-status')
  async domainChangeStatus(@Body() body: ChangeStatus): Promise<IApiResponse> {
    try {
      const domainChangeStatus = await this.domainService.domainChangeStatus(
        body.ids,
        body.status
      );

      const isSuccess = Boolean(domainChangeStatus.affected);

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

  // Domain Autocomplete
  @Get('root-autocomplete')
  async rootDomainAutocomplete(): Promise<
    IApiResponse<IRootDomainAutoComplete>
  > {
    try {
      const domainData = await this.domainService.rootDomainAutocomplete();

      // const domainData = [
      //   {
      //     rootDomainId: 1,
      //     rootDomainUrl: 'http://localhost:8080',
      //   },
      // ];
      const isSuccess = Boolean(domainData && domainData.length > 0);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        data: domainData || [],
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

  // Domain Details
  @Get(':id')
  async domainDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse<IDomainDetail>> {
    try {
      const getDomainDetails = await this.domainService.domainDetail(id);
      const isSuccess = Boolean(getDomainDetails);
      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: getDomainDetails || {},
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
