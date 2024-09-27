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
  ILandingPageAutoComplete,
  ILandingPageDetail,
  ILandingPageRecord,
} from '../../interfaces/landing-page.interface';
import { LandingPagesService } from './landing-pages.service';
import { LandingPageDto } from './dto/landing-page.dto';

@Controller('landing-page')
export class LandingPagesController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private landingPageService: LandingPagesService,
    private customUtility: Custom
  ) {}
  private entity = 'Landing Page';

  // LandingPage List
  @Post('list')
  async landingPageList(
    @Body() body: ListDto
  ): Promise<IApiResponse<ILandingPageDetail>> {
    try {
      const landingPageList =
        await this.landingPageService.findAllLandingPages(body);

      const isSuccess: boolean =
        landingPageList && landingPageList.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? landingPageList : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // LandingPage Add
  @Post('add')
  async create(
    @Body() body: LandingPageDto
  ): Promise<IApiResponse<ILandingPageRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };
      const title = body.title;

      const isLandingPageExists =
        await this.landingPageService.getTitleForAdd(title);
      if (isLandingPageExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const addLandingPage =
          await this.landingPageService.createLandingPage(body);

        if (addLandingPage) {
          result.success = SUCCESS.true;
          result.statusCode = HttpStatus.CREATED;
          result.action = ACTIONS.ADDED;
          result.data = {
            LandingPageId: addLandingPage.identifiers[0].landingPageId,
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

  // LandingPage Update
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: LandingPageDto
  ): Promise<IApiResponse<ILandingPageRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };
      const title = body.title;

      const isLandingPageExists =
        await this.landingPageService.getTitleForUpdate(title, id);
      if (isLandingPageExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const updateLandingPage =
          await this.landingPageService.updateLandingPage(body, id);

        if (updateLandingPage && updateLandingPage.affected > SUCCESS.false) {
          result.success = SUCCESS.true;
          result.action = ACTIONS.UPDATED;
          result.data = {
            landingPageId: id,
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

  // LandingPage Delete
  @Delete(':id')
  async landingPageDelete(@Param('id') id: number): Promise<IApiResponse> {
    try {
      const deleteLandingPage =
        await this.landingPageService.deleteLandingPage(id);

      const isSuccess = Boolean(deleteLandingPage.affected);

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

  // LandingPage Autocomplete
  @Get('autocomplete')
  async landingPageAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<ILandingPageAutoComplete>> {
    try {
      const landingPageData =
        await this.landingPageService.landingPageAutocomplete(body);

      const isSuccess = Boolean(
        landingPageData && landingPageData.length > SUCCESS.false
      );

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        data: landingPageData || [],
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

  // LandingPage Change Status
  @Post('change-status')
  async landingPageChangeStatus(
    @Body() body: ChangeStatus
  ): Promise<IApiResponse> {
    try {
      const landingPageChangeStatus =
        await this.landingPageService.landingPageChangeStatus(
          body.ids,
          body.status
        );

      const isSuccess = Boolean(landingPageChangeStatus.affected);

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

  // LandingPage Details
  @Get(':id')
  async LandingPageDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse<ILandingPageDetail>> {
    try {
      const getLandingPageDetails =
        await this.landingPageService.landingPageDetail(id);
      const isSuccess = Boolean(getLandingPageDetails);
      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: getLandingPageDetails || {},
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
