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
  IPolicyAutoComplete,
  IPolicyDetail,
  IPolicyRecord,
} from '../../interfaces/policy.interface';
import { PoliciesService } from './policies.service';
import { PolicyDto } from './dto/policy.dto';
import { CommonConfigService } from '@app/common-config/common-config.service';
import { DateService } from '@app/services/services/date.service';

@Controller('policy')
export class PoliciesController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private policiesService: PoliciesService,
    private customUtility: Custom,
    private commonService: CommonConfigService,
    private dateService: DateService
  ) {}
  private entity = 'Policy';

  // Policy List
  @Post('list')
  async policyList(
    @Body() body: ListDto
  ): Promise<IApiResponse<IPolicyDetail>> {
    try {
      const policyList = await this.policiesService.findAllPolicies(body);
      const isSuccess: boolean = policyList && policyList.data ? true : false;

      policyList.data = await this.commonService.getImageUrl(
        policyList.data,
        'policies'
      );

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? policyList : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Policy Add
  @Post('add')
  async create(@Body() body: PolicyDto): Promise<IApiResponse<IPolicyRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        data: {},
        message: '',
      };
      const checkDates = this.dateService.validateDates(
        body.startDate,
        body.endDate
      );
      if (checkDates && checkDates.valid) {
        const title = body.title;

        const isPolicyExists = await this.policiesService.getTitleForAdd(title);
        if (isPolicyExists) {
          result.statusCode = HttpStatus.CONFLICT;
          result.action = ACTIONS.CODE_EXIST;
        } else {
          const uploadInfo = await this.commonService.processAndValidateFile(
            body.document
          );

          if ('name' in uploadInfo) {
            body.document = uploadInfo.name;
          }
          const addPolicy = await this.policiesService.createPolicy(body);

          if (addPolicy) {
            uploadInfo.folderName = 'policies/';
            this.commonService.uploadFolderImage(uploadInfo);
            result.success = SUCCESS.true;
            result.statusCode = HttpStatus.CREATED;
            result.action = ACTIONS.ADDED;
            result.data = { policyId: addPolicy.identifiers[0].policyId };
          }
        }
      } else {
        result.message = checkDates.message;
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

  // Policy Update
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PolicyDto
  ): Promise<IApiResponse<IPolicyRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };
      const title = body.title;

      const isPolicyExists = await this.policiesService.getTitleForUpdate(
        title,
        id
      );
      if (isPolicyExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const uploadInfo = await this.commonService.processAndValidateFile(
          body.document
        );

        if ('name' in uploadInfo) {
          body.document = uploadInfo.name;
        }

        const updatePolicy = await this.policiesService.updatePolicy(body, id);

        if (updatePolicy && updatePolicy.affected > SUCCESS.false) {
          uploadInfo.folderName = 'policies/';
          this.commonService.uploadFolderImage(uploadInfo);
          result.success = SUCCESS.true;
          result.action = ACTIONS.UPDATED;
          result.data = { policyId: id };
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

  // Policy Delete
  @Delete(':id')
  async policyDelete(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse> {
    try {
      const deletePolicy = await this.policiesService.deletePolicy(id);
      const isSuccess = Boolean(deletePolicy.affected);

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

  // Policy Autocomplete
  @Get('autocomplete')
  async policyAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<IPolicyAutoComplete>> {
    try {
      const policyData = await this.policiesService.policyAutocomplete(body);
      const isSuccess = Boolean(
        policyData && policyData.length > SUCCESS.false
      );

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        data: policyData || [],
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

  // Policy Change Status
  @Post('change-status')
  async policyChangeStatus(@Body() body: ChangeStatus): Promise<IApiResponse> {
    try {
      const policyChangeStatus = await this.policiesService.policyChangeStatus(
        body.ids,
        body.status
      );
      const isSuccess = Boolean(policyChangeStatus.affected);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        action: isSuccess ? ACTIONS.CHANGE_STATUS : ACTIONS.STATUS_NOT_CHANGE,
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

  // Policy Details
  @Get(':id')
  async policyDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse<IPolicyDetail>> {
    try {
      let getPolicyDetails = await this.policiesService.policyDetail(id);
      const isSuccess = Boolean(getPolicyDetails);

      getPolicyDetails = await this.commonService.getImageUrl(
        getPolicyDetails,
        'policies'
      );

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: getPolicyDetails || {},
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
