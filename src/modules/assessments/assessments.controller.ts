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
  Req,
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
  IAssessmentAutoComplete,
  IAssessmentDetail,
  IAssessmentRecord,
} from '../../interfaces/assessment.interface';
import { AssessmentService } from './assessments.service';
import { AssessmentDto } from './dto/assessment.dto';

@Controller('assessment')
export class AssessmentController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private assessmentService: AssessmentService,
    private customUtility: Custom
  ) {}
  private entity = 'Assessment';

  // Assessment List
  @Post('list')
  async assessmentList(
    @Body() body: ListDto
  ): Promise<IApiResponse<IAssessmentDetail>> {
    try {
      const assessmentDetails =
        await this.assessmentService.findAllAssessments(body);

      const isSuccess: boolean =
        assessmentDetails && assessmentDetails.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? assessmentDetails : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Assessment Add
  @Post('add')
  async create(
    @Body() body: AssessmentDto,
    @Req() req: any
  ): Promise<IApiResponse<IAssessmentRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };

      body.addedBy = req.user.userId;
      const addAssessment = await this.assessmentService.createAssessment(body);

      if (addAssessment) {
        result.success = SUCCESS.true;
        result.statusCode = HttpStatus.CREATED;
        result.action = ACTIONS.ADDED;
        result.data = {
          assessmentId: addAssessment.identifiers[0].assessmentId,
        };
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

  // Assessment Update
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AssessmentDto
  ): Promise<IApiResponse<IAssessmentRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };

      const updateAssessment = await this.assessmentService.updateAssessment(
        body,
        id
      );
      if (updateAssessment && updateAssessment.affected > SUCCESS.false) {
        result.success = SUCCESS.true;
        result.action = ACTIONS.UPDATED;
        result.data = {
          assessmentId: id,
        };
        result.statusCode = HttpStatus.OK;
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

  // Assessment Delete
  @Delete(':id')
  async assessmentDelete(@Param('id') id: number): Promise<IApiResponse> {
    try {
      const deleteAssessment =
        await this.assessmentService.deleteAssessment(id);

      const isSuccess = Boolean(deleteAssessment.affected);

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

  // Assessment Autocomplete
  @Get('autocomplete')
  async assessmentAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<IAssessmentAutoComplete>> {
    try {
      const assessmentData =
        await this.assessmentService.assessmentAutocomplete(body);

      const isSuccess = Boolean(
        assessmentData && assessmentData.length > SUCCESS.false
      );

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        data: assessmentData || [],
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

  // Assessment Change Status
  @Post('change-status')
  async assessmentChangeStatus(
    @Body() body: ChangeStatus
  ): Promise<IApiResponse> {
    try {
      const assessmentChangeStatus =
        await this.assessmentService.changeAssessmentStatus(
          body.ids,
          body.status
        );

      const isSuccess = Boolean(assessmentChangeStatus.affected);

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

  // Assessment Details
  @Get(':id')
  async assessmentDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse<IAssessmentDetail>> {
    try {
      const getAssessmentDetails =
        await this.assessmentService.assessmentDetail(id);

      const isSuccess = Boolean(getAssessmentDetails);
      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: getAssessmentDetails || {},
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
