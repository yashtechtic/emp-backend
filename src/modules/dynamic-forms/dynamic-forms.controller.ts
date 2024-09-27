import { AutocompleteDto } from '@app/common-config/dto/common.dto';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';
import { IFormAutoComplete } from '@app/interfaces/companies/dynamic-form.interface';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  LoggerService,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { DynamicFormsService } from './dynamic-forms.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Custom } from '@app/utilities/custom.utility';
import { ACTIONS } from '@app/utilities/action';
import { MESSAGE } from '@app/utilities/message';

@Controller('dynamic-forms')
export class DynamicFormsController {
  constructor(
    private dynamicFormsService: DynamicFormsService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private customUtility: Custom
  ) {}
  entity = 'dynamic-forms';

  // Form Autocomplete
  @Get('autocomplete')
  async formAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<IFormAutoComplete>> {
    try {
      const formData = await this.dynamicFormsService.formAutocomplete(body);

      const isSuccess = Boolean(formData && formData.length > SUCCESS.false);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        data: formData || [],
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

  // Form Details
  @Get(':id')
  async formDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse<any>> {
    try {
      const getFormDetails = await this.dynamicFormsService.formDetail(id);
      const isSuccess = Boolean(getFormDetails);
      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: getFormDetails || {},
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
