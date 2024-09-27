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
import { AutocompleteDto, ListDto } from '@app/common-config/dto/common.dto';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';

import {
  IPhishingSimulationAutoComplete,
  IPhishingSimulationDetail,
  IPhishingSimulationRecord,
} from '../../interfaces/phishing-simulation.interface';
import { PhisingSimulationService } from './phishing-simulation.service';
import { PhishingSimulationDto } from './dto/phishing-simulation.dto';

@Controller('phishing-simulation')
export class PhishingSimulationController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private phishingSimulationService: PhisingSimulationService,
    private customUtility: Custom
  ) {}
  private entity = 'Phishing Simulation';

  @Post('list')
  async phishingSimulationList(
    @Body() body: ListDto
  ): Promise<IApiResponse<IPhishingSimulationDetail>> {
    try {
      const phishingSimulationList =
        await this.phishingSimulationService.findAllPhishingSimulation(body);

      const isSuccess: boolean =
        phishingSimulationList && phishingSimulationList.data ? true : false;

      return this.customUtility.getResponseTemplate({
        success: SUCCESS.true,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? phishingSimulationList : [],
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('add')
  async create(
    @Body() body: PhishingSimulationDto,
    @Req() req: any
  ): Promise<IApiResponse<IPhishingSimulationRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.OK,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };
      const isPhishingSimulationExists =
        await this.phishingSimulationService.getProgramNameForAdd(
          body.programName
        );
      if (isPhishingSimulationExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        body.addedBy = req.user.userId;
        body.updatedBy = req.user.userId;
        const addPhishingSimulation =
          await this.phishingSimulationService.createPhishingSimulation(body);

        if (addPhishingSimulation) {
          result.success = SUCCESS.true;
          result.statusCode = HttpStatus.CREATED;
          result.action = ACTIONS.ADDED;
          result.data = {
            PhishingSimulationId:
              addPhishingSimulation.identifiers[0].phishingSimulationId,
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

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PhishingSimulationDto,
    @Req() req: any
  ): Promise<IApiResponse<IPhishingSimulationRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };
      const name = body.programName;

      const isPhishingSimulationExists =
        await this.phishingSimulationService.getProgramNameForUpdate(name, id);
      console.log(isPhishingSimulationExists);
      if (isPhishingSimulationExists) {
        result.statusCode = HttpStatus.CONFLICT;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        body.addedBy = req.user.userId;
        body.updatedBy = req.user.userId;
        const updatePhishingSimulation =
          await this.phishingSimulationService.updatePhishingSimulation(
            body,
            id
          );

        if (
          updatePhishingSimulation &&
          updatePhishingSimulation.affected > SUCCESS.false
        ) {
          result.success = SUCCESS.true;
          result.action = ACTIONS.UPDATED;
          result.data = {
            phishingSimulationId: id,
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

  @Delete(':id')
  async phishingSimulationDelete(
    @Param('id') id: number
  ): Promise<IApiResponse> {
    try {
      const deletePhishingSimulation =
        await this.phishingSimulationService.deletePhishingSimulation(id);

      const isSuccess = Boolean(deletePhishingSimulation.affected);

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

  @Get('autocomplete')
  async phishingSimulationAutocomplete(
    @Query() body: AutocompleteDto
  ): Promise<IApiResponse<IPhishingSimulationAutoComplete>> {
    try {
      const phishingSimulationData =
        await this.phishingSimulationService.phishingSimulationAutocomplete(
          body
        );

      const isSuccess = Boolean(
        phishingSimulationData && phishingSimulationData.length > SUCCESS.false
      );

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.LIST_FOUND : ACTIONS.LIST_NOT_FOUND,
        data: phishingSimulationData || [],
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

  //   @Post('change-status')
  //   async phishingSimulationChangeStatus(
  //     @Body() body: ChangeStatus
  //   ): Promise<IApiResponse> {
  //     try {
  //       const phishingSimulationChangeStatus =
  //         await this.phishingSimulationService.phishingSimulationChangeStatus(
  //           body.ids,
  //           body.status
  //         );

  //       const isSuccess = Boolean(phishingSimulationChangeStatus.affected);

  //       return this.customUtility.getResponseTemplate({
  //         success: isSuccess ? SUCCESS.true : SUCCESS.false,
  //         statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
  //         action: isSuccess ? ACTIONS.CHANGE_STATUS : ACTIONS.STATUS_NOT_CHANGE,
  //       });
  //     } catch (err) {
  //       this.logger.error(err);
  //       throw new HttpException(
  //         MESSAGE.DEFAULT_MESSAGE(),
  //         HttpStatus.INTERNAL_SERVER_ERROR
  //       );
  //     }
  //   }

  @Get(':id')
  async PhishingSimulationDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse<IPhishingSimulationDetail>> {
    try {
      const getPhishingSimulationDetails =
        await this.phishingSimulationService.phishingSimulationDetail(id);
      const isSuccess = Boolean(getPhishingSimulationDetails);
      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.DETAIL_FOUND : ACTIONS.DETAIL_NOT_FOUND,
        entity: this.entity,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: getPhishingSimulationDetails || {},
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
