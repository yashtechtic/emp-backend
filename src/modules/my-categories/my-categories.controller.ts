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
import { ChangeStatus, ListDto } from '@app/common-config/dto/common.dto';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';

import {
  IMyCategoryAutoComplete,
  IMyCategoryDetail,
  IMyCategoryRecord,
} from '../../interfaces/my-category.interface';
import { MyCategoriesService } from './my-categories.service';
import {
  MyCategoryDto,
  AutocompleteDto,
  CategoryUpdateDto,
} from './dto/my-category.dto';

@Controller('my-category')
export class MyCategoriesController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private myCategoryService: MyCategoriesService,
    private customUtility: Custom
  ) {}
  private entity = 'My Category';

  // My Category List
  @Post('list')
  async myCategoryList(
    @Body() body: ListDto
  ): Promise<IApiResponse<IMyCategoryDetail>> {
    try {
      const myCategoryList =
        await this.myCategoryService.findAllCategories(body);

      const isSuccess: boolean =
        myCategoryList && myCategoryList.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? myCategoryList : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // My Category Add
  @Post('add')
  async create(
    @Body() body: MyCategoryDto
  ): Promise<IApiResponse<IMyCategoryRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };
      const categoryName = body.categoryName;

      const isMyCategoryExists =
        await this.myCategoryService.getCategoryNameForAdd(
          categoryName,
          body.categoryType
        );
      if (isMyCategoryExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const addMyCategory =
          await this.myCategoryService.createMyCategory(body);

        if (addMyCategory) {
          result.success = SUCCESS.true;
          result.statusCode = HttpStatus.CREATED;
          result.action = ACTIONS.ADDED;
          result.data = {
            myCategoryId: addMyCategory.identifiers[0].myCategoryId,
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

  // My Category Update
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: MyCategoryDto
  ): Promise<IApiResponse<IMyCategoryRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };

      const isMyCategoryExists =
        await this.myCategoryService.getCategoryNameForUpdate(
          body.categoryName,
          body.categoryType,
          id
        );
      if (isMyCategoryExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const updateMyCategory = await this.myCategoryService.updateMyCategory(
          body,
          id
        );
        if (updateMyCategory && updateMyCategory.affected > SUCCESS.false) {
          result.success = SUCCESS.true;
          result.action = ACTIONS.UPDATED;
          result.data = {
            myCategoryId: id,
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
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // My Category Delete
  @Delete(':id')
  async myCategoryDelete(@Param('id') id: number): Promise<IApiResponse> {
    try {
      const deletemyCategory =
        await this.myCategoryService.deleteMyCategory(id);

      const isSuccess = Boolean(deletemyCategory.affected);

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

  // My Category Autocomplete
  @Get('autocomplete')
  async myCategoryAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<IMyCategoryAutoComplete>> {
    try {
      const myCategoryData =
        await this.myCategoryService.myCategoryAutocomplete(body);

      const isSuccess = Boolean(
        myCategoryData && myCategoryData.length > SUCCESS.false
      );

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        data: myCategoryData || [],
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

  // My Category Change Status
  @Post('change-status')
  async myCategoryChangeStatus(
    @Body() body: ChangeStatus
  ): Promise<IApiResponse> {
    try {
      const myCategoryChangeStatus =
        await this.myCategoryService.myCategoryChangeStatus(
          body.ids,
          body.status
        );

      const isSuccess = Boolean(myCategoryChangeStatus.affected);

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

  // My Category Update
  @Post('module-category')
  async categoryUpdates(
    @Body() body: CategoryUpdateDto
  ): Promise<IApiResponse> {
    try {
      const updateModuleCategoried =
        await this.myCategoryService.updateModuleCategory(body);

      const isSuccess = Boolean(updateModuleCategoried.affected);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        action: isSuccess ? ACTIONS.UPDATED : ACTIONS.NOT_UPDATED,
        entity: 'Module Category',
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  // My Category Details
  @Get(':id')
  async myCategoryDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse<IMyCategoryDetail>> {
    try {
      const getMyCategoryDetails =
        await this.myCategoryService.myCategoryDetail(id);
      const isSuccess = Boolean(getMyCategoryDetails);
      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: getMyCategoryDetails || {},
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
