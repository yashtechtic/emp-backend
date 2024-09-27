import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  LoggerService,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SubscriptionService } from './subscription.service';
import { SubscriptionDto } from './dto/subscription.dto';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';
import {
  ISubscriptionList,
  ISubscriptionRecord,
} from '@app/interfaces/subscription.interface';
import { MESSAGE } from '@app/utilities/message';
import { ACTIONS } from '@app/utilities/action';
import { Custom } from '@app/utilities/custom.utility';
import { Status } from '@app/common-config/dto/common.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly subscriptionService: SubscriptionService,
    private readonly customUtility: Custom
  ) {}

  private readonly entity = 'Subscription';

  @Post('add')
  async createSubscription(
    @Body() body: SubscriptionDto
  ): Promise<IApiResponse<ISubscriptionRecord>> {
    try {
      const planCode = body.planName.toUpperCase();
      const result = {
        success: SUCCESS.false,
        entity: this.entity,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.NOT_ADDED,
        data: {},
      };

      const checkPlanCode =
        await this.subscriptionService.checksubscriptionDetail(planCode);

      if (checkPlanCode) {
        result.statusCode = HttpStatus.BAD_REQUEST;
        result.action = ACTIONS.CODE_EXIST;
      } else {
        const subscription = await this.subscriptionService.createSubscription({
          ...body,
          planCode,
        });

        if (subscription) {
          result.success = SUCCESS.true;
          result.statusCode = HttpStatus.CREATED;
          result.action = ACTIONS.ADDED;
          result.data = subscription;
        }
      }

      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: this.entity,
        data: result.data,
        statusCode: result.statusCode,
      });
    } catch (error) {
      console.log('createSubscription Error->>', error);
      this.logger.error('Error in createSubscription:', error);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  async updateSubscription(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SubscriptionDto
  ): Promise<IApiResponse<ISubscriptionRecord>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };

      const subscriptionData =
        await this.subscriptionService.subscriptionDetail(id);

      if (!subscriptionData) {
        result.statusCode = HttpStatus.NOT_FOUND;
        result.action = ACTIONS.NOT_EXIST;
      } else {
        const subscription = await this.subscriptionService.updateSubscription(
          Number(id),
          body
        );

        if (subscription) {
          result.success = SUCCESS.true;
          result.statusCode = HttpStatus.OK;
          result.action = ACTIONS.UPDATED;
          result.data = subscription;
        }
      }
      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: this.entity,
        data: result.data,
        statusCode: result.statusCode,
      });
    } catch (error) {
      console.log('updateSubscription Error->>', error);
      this.logger.error('Error in updateSubscription:', error);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('list')
  async getAllSubscription(): Promise<IApiResponse<ISubscriptionList>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };
      const subscriptionData =
        await this.subscriptionService.getAllSubscription();
      if (!subscriptionData) {
        result.statusCode = HttpStatus.NOT_FOUND;
        result.action = ACTIONS.NOT_EXIST;
      } else {
        const activeSubscriptionData = subscriptionData.filter(
          (element) => element.status === Status.Active && !element.isDeleted
        );
        result.success = SUCCESS.true;
        result.statusCode = HttpStatus.OK;
        result.action = ACTIONS.DETAIL_FOUND;
        result.data = activeSubscriptionData;
      }
      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: this.entity,
        data: result.data,
        statusCode: result.statusCode,
      });
    } catch (error) {
      console.log('getAllSubscription Error->>', error);
      this.logger.error('Error in getAllSubscription:', error);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async getSubscriptionById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse<ISubscriptionList>> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_UPDATED,
        data: {},
      };

      const subscriptionDetailById =
        await this.subscriptionService.subscriptionDetail(Number(id));

      if (
        !subscriptionDetailById ||
        (subscriptionDetailById &&
          subscriptionDetailById.status === Status.Inactive &&
          subscriptionDetailById.isDeleted)
      ) {
        result.statusCode = HttpStatus.NOT_FOUND;
        result.action = ACTIONS.NOT_EXIST;
      } else {
        result.success = SUCCESS.true;
        result.statusCode = HttpStatus.OK;
        result.action = ACTIONS.DETAIL_FOUND;
        result.data = subscriptionDetailById;
      }
      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: this.entity,
        data: result.data,
        statusCode: result.statusCode,
      });
    } catch (error) {
      console.log('getSubscriptionById Error->>', error);
      this.logger.error('Error in getSubscriptionById:', error);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async deleteSubscription(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IApiResponse> {
    try {
      const result = {
        success: SUCCESS.false,
        statusCode: HttpStatus.NOT_FOUND,
        action: ACTIONS.NOT_DELETED,
        data: {},
      };
      const subscriptionData =
        await this.subscriptionService.subscriptionDetail(id);
      if (!subscriptionData) {
        result.statusCode = HttpStatus.NOT_FOUND;
        result.action = ACTIONS.NOT_EXIST;
      } else {
        const deleteSubscription =
          await this.subscriptionService.deleteSubscription(Number(id));
        if (deleteSubscription) {
          result.success = SUCCESS.true;
          result.statusCode = HttpStatus.OK;
          result.action = ACTIONS.DELETED;
        }
      }
      return this.customUtility.getResponseTemplate({
        success: result.success,
        action: result.action,
        entity: this.entity,
        data: result.data,
        statusCode: result.statusCode,
      });
    } catch (error) {
      console.log('deleteSubscription Error->>', error);
      this.logger.error('Error in deleteSubscription:', error);
      throw new HttpException(
        MESSAGE.DEFAULT_MESSAGE(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
