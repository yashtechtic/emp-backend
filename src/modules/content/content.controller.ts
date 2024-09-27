import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  Query,
  HttpStatus,
  HttpException,
  LoggerService,
  Inject,
  ParseIntPipe,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';
import { CreateContentDto } from './dto/content.dto';
import { ContentService } from './content.service';
import {
  IContentList,
  IContentRecord,
  IContentAutoComplete,
} from '../../interfaces/content.interface';
import { Custom } from '@app/utilities/custom.utility';
import { ACTIONS } from '@app/utilities/action';
import { MESSAGE } from '@app/utilities/message';
import { Content } from './entities/content.entity';
import { CommonConfigService } from '@app/common-config/common-config.service';
import { AutocompleteDto } from '@app/common-config/dto/common.dto';

@Controller('content')
export class ContentController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private contentService: ContentService,
    private customUtility: Custom,
    private commonService: CommonConfigService
  ) {}
  private entity = 'content';

  // Content List
  @Post('list')
  async contentList(
    @Req() req,
    @Body() body: { keyword?: string; page?: number; perPage?: number }
  ): Promise<IApiResponse<IContentList>> {
    try {
      const contentList = await this.contentService.findAllContent(body);
      contentList.data = await this.commonService.getImageUrl(
        contentList.data,
        'content'
      );
      const isSuccess: boolean = contentList && contentList.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: 1,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? contentList : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Content Autocomplete
  @Get('autocomplete')
  async contentAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<IContentAutoComplete[]>> {
    try {
      const contentResults =
        await this.contentService.getContentAutocomplete(body);
      const isSuccess = Boolean(contentResults && contentResults.length > 0);

      return this.customUtility.getResponseTemplate({
        success: 1,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? contentResults : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Content Details
  @Get(':id')
  async contentDetails(
    @Param('id') id: number
  ): Promise<IApiResponse<Content>> {
    try {
      let contentDetails = await this.contentService.findOneContent(id);
      contentDetails = await this.commonService.getImageUrl(
        contentDetails,
        'content'
      );
      const isSuccess = Boolean(contentDetails);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: contentDetails || {},
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Content Add
  @Post('add')
  async contentCreate(
    @Body() body: CreateContentDto,
    @Req() req: any
  ): Promise<IApiResponse<IContentRecord>> {
    try {
      body.addedBy = req.user.userId;
      const uploadInfo = await this.commonService.processAndValidateFile(
        body.image
      );

      if ('name' in uploadInfo) {
        body.image = uploadInfo.name;
      }
      const addedContent = await this.contentService.createContent(body);
      if (addedContent) {
        uploadInfo.folderName = 'content/';
        this.commonService.uploadFolderImage(uploadInfo);
      }
      const result = {
        success: addedContent ? 1 : 0,
        statusCode: addedContent
          ? HttpStatus.CREATED
          : HttpStatus.INTERNAL_SERVER_ERROR,
        action: addedContent ? ACTIONS.ADDED : ACTIONS.NOT_ADDED,
        data: addedContent
          ? { contentId: addedContent.identifiers[0].contentId }
          : {},
      };

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

  // Content Update
  @Put(':id')
  async contentUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateContentDto
  ): Promise<IApiResponse<IContentRecord>> {
    try {
      const uploadInfo = await this.commonService.processAndValidateFile(
        body.image
      );

      if ('name' in uploadInfo) {
        body.image = uploadInfo.name;
      }
      const updatedContent = await this.contentService.updateContent(id, body);
      if (updatedContent) {
        uploadInfo.folderName = 'content/';
        this.commonService.uploadFolderImage(uploadInfo);
      }
      const result = {
        success: updatedContent.affected ? 1 : 0,
        statusCode: updatedContent.affected
          ? HttpStatus.OK
          : HttpStatus.NOT_FOUND,
        action: updatedContent.affected ? ACTIONS.UPDATED : ACTIONS.NOT_UPDATED,
        data: updatedContent.affected ? { contentId: id } : {},
      };

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

  // Content Delete
  @Delete(':id')
  async contentDelete(@Param('id') id: number): Promise<IApiResponse> {
    try {
      const result = {
        success: 0,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_DELETED,
        data: {},
      };

      const deleteResult = await this.contentService.deleteContent(id);

      if (deleteResult.affected) {
        result.success = 1;
        result.statusCode = HttpStatus.OK;
        result.action = ACTIONS.DELETED;
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
}
