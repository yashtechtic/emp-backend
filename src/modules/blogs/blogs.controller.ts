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
  IBlogAutoComplete,
  IBlogDetail,
  IBlogRecord,
} from '../../interfaces/blog.interface';
import { BlogsService } from './blogs.service';
import { BlogDto } from './dto/blog.dto';
import { CommonConfigService } from '@app/common-config/common-config.service';

@Controller('blog')
export class BlogsController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private blogService: BlogsService,
    private customUtility: Custom,
    private commonService: CommonConfigService
  ) {}
  private entity = 'Blog';

  // Blog List
  @Post('list')
  async blogList(@Body() body: ListDto): Promise<IApiResponse<IBlogDetail>> {
    try {
      const blogDetails = await this.blogService.findAllBlogs(body);
      blogDetails.data = await this.commonService.getImageUrl(
        blogDetails.data,
        'blogs'
      );
      const isSuccess: boolean = blogDetails && blogDetails.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? blogDetails : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Blog Add
  @Post('add')
  async create(@Body() body: BlogDto): Promise<IApiResponse<IBlogRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };
      const title = body.title;

      const uploadInfo = await this.commonService.processAndValidateFile(
        body.image
      );

      if ('name' in uploadInfo) {
        body.image = uploadInfo.name;
      }

      const isTitleExists = await this.blogService.getBlogTitleForAdd(title);
      if (isTitleExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const addBlog = await this.blogService.createBlog(body);

        if (addBlog) {
          uploadInfo.folderName = 'blogs/';
          this.commonService.uploadFolderImage(uploadInfo);

          result.success = SUCCESS.true;
          result.statusCode = HttpStatus.CREATED;
          result.action = ACTIONS.ADDED;
          result.data = {
            blogId: addBlog.identifiers[0].blogId,
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

  // Blog Update
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: BlogDto
  ): Promise<IApiResponse<IBlogRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };
      const title = body.title;
      const uploadInfo = await this.commonService.processAndValidateFile(
        body.image
      );

      if ('name' in uploadInfo) {
        body.image = uploadInfo.name;
      }
      const isBlogExists = await this.blogService.getBlogTitleForUpdate(
        title,
        id
      );
      if (isBlogExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const updateBlog = await this.blogService.updateBlog(body, id);

        if (updateBlog && updateBlog.affected > SUCCESS.false) {
          uploadInfo.folderName = 'blogs/';
          this.commonService.uploadFolderImage(uploadInfo);
          result.success = SUCCESS.true;
          result.action = ACTIONS.UPDATED;
          result.data = {
            blogId: id,
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

  // Blog Delete
  @Delete(':id')
  async blogDelete(@Param('id') id: number): Promise<IApiResponse> {
    try {
      const deleteBlog = await this.blogService.deleteBlog(id);

      const isSuccess = Boolean(deleteBlog.affected);

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

  // Blog Autocomplete
  @Get('autocomplete')
  async blogAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<IBlogAutoComplete>> {
    try {
      const blogData = await this.blogService.blogAutocomplete(body);

      const isSuccess = Boolean(blogData && blogData.length > SUCCESS.false);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        data: blogData || [],
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

  // Blog Change Status
  @Post('change-status')
  async blogChangeStatus(@Body() body: ChangeStatus): Promise<IApiResponse> {
    try {
      const blogChangeStatus = await this.blogService.blogChangeStatus(
        body.ids,
        body.status
      );

      const isSuccess = Boolean(blogChangeStatus.affected);

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

  // Blog Details
  @Get(':id')
  async blogDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse<IBlogDetail>> {
    try {
      let getBlogDetails = await this.blogService.blogDetail(id);
      getBlogDetails = await this.commonService.getImageUrl(
        getBlogDetails,
        'blogs'
      );
      const isSuccess = Boolean(getBlogDetails);
      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: getBlogDetails || {},
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
