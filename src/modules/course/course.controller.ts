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
import { CourseDto } from './dto/course.dto';
import { CourseService } from './course.service';
import {
  ICourseList,
  ICourseRecord,
  ICourseAutoComplete,
} from '@app/interfaces/course.interface';
import { Custom } from '@app/utilities/custom.utility';
import { ACTIONS } from '@app/utilities/action';
import { MESSAGE } from '@app/utilities/message';
import { Course } from './entities/course.entity';
import { AutocompleteDto, ListDto } from '@app/common-config/dto/common.dto';
import { CommonConfigService } from '@app/common-config/common-config.service';

@Controller('course')
export class CourseController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private courseService: CourseService,
    private customUtility: Custom,
    private commonService: CommonConfigService
  ) {}
  private entity = 'course';

  // Course List
  @Post('list')
  async courseList(
    @Req() req,
    @Body() body: ListDto
  ): Promise<IApiResponse<ICourseList>> {
    try {
      //const checkDates = this.generalUtility.checkStartEndDate(body);
      // if(checkDates){

      // }
      const courseList = await this.courseService.findAllCourses(body);
      courseList.data = await this.commonService.getImageUrl(
        courseList.data,
        'courses'
      );
      const isSuccess: boolean = courseList && courseList.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: 1,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? courseList : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Course Autocomplete
  @Get('autocomplete')
  async courseAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<ICourseAutoComplete[]>> {
    try {
      const courseResults =
        await this.courseService.getCourseAutocomplete(body);
      const isSuccess = Boolean(courseResults && courseResults.length > 0);

      return this.customUtility.getResponseTemplate({
        success: 1,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? courseResults : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Course Details
  @Get(':id')
  async courseDetails(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse<Course>> {
    try {
      let courseDetails = await this.courseService.findOneCourse(id);
      courseDetails = await this.commonService.getImageUrl(
        courseDetails,
        'courses'
      );
      const isSuccess = Boolean(courseDetails);

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: courseDetails || {},
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Course Add
  @Post('add')
  async courseCreate(
    @Body() body: CourseDto,
    @Req() req: any
  ): Promise<IApiResponse<ICourseRecord>> {
    try {
      body.addedBy = req.user.userId;
      const uploadInfo = await this.commonService.processAndValidateFile(
        body.image
      );

      if ('name' in uploadInfo) {
        body.image = uploadInfo.name;
      }
      const addedCourse = await this.courseService.createCourse(body);
      if (addedCourse) {
        uploadInfo.folderName = 'courses/';
        this.commonService.uploadFolderImage(uploadInfo);
      }
      const result = {
        success: addedCourse ? 1 : 0,
        statusCode: addedCourse
          ? HttpStatus.CREATED
          : HttpStatus.INTERNAL_SERVER_ERROR,
        action: addedCourse ? ACTIONS.ADDED : ACTIONS.NOT_ADDED,
        data: addedCourse
          ? { courseId: addedCourse.identifiers[0].courseId }
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
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Course Update
  @Put(':id')
  async courseUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CourseDto
  ): Promise<IApiResponse<ICourseRecord>> {
    try {
      const uploadInfo = await this.commonService.processAndValidateFile(
        body.image
      );

      if ('name' in uploadInfo) {
        body.image = uploadInfo.name;
      }
      const updatedCourse = await this.courseService.updateCourse(id, body);
      if (updatedCourse) {
        uploadInfo.folderName = 'courses/';
        this.commonService.uploadFolderImage(uploadInfo);
      }
      const result = {
        success: updatedCourse.affected ? 1 : 0,
        statusCode: updatedCourse.affected
          ? HttpStatus.OK
          : HttpStatus.NOT_FOUND,
        action: updatedCourse.affected ? ACTIONS.UPDATED : ACTIONS.NOT_UPDATED,
        data: updatedCourse.affected ? { courseId: id } : {},
      };

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

  // Course Delete
  @Delete(':id')
  async courseDelete(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse> {
    try {
      const result = {
        success: 0,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_DELETED,
        data: {},
      };

      const deleteResult = await this.courseService.deleteCourse(id);

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
