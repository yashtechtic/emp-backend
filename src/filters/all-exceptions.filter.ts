import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody = {
      settings: {
        status: httpStatus,
        success: 0,
        message: 'Data not found',
      },
      data: [],
    };

    if (exception instanceof HttpException) {
      let errMessage: string;
      if (typeof exception.getResponse === 'function') {
        const responseObject = exception.getResponse();
        errMessage =
          responseObject && typeof responseObject === 'object'
            ? (Array.isArray(responseObject['message'])
                ? responseObject['message'][0]
                : responseObject['message']) || 'Internal Server Error'
            : responseObject || 'Internal Server Error';
      } else {
        errMessage = exception.message || 'Internal Server Error';
      }

      responseBody = {
        settings: {
          status: exception.getStatus() || HttpStatus.OK,
          success: 0,
          message: errMessage,
        },
        data: [],
      };
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
