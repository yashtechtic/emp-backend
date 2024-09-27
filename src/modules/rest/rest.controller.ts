import {
  Controller,
  HttpStatus,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpException,
  LoggerService,
  Inject,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { Custom } from '@app/utilities/custom.utility';
import { RestService } from './rest.service';
import {
  IApiResponse,
  SUCCESS,
} from '@app/common-config/interfaces/common-interface';
import { ACTIONS } from '@app/utilities/action';
import { MESSAGE } from '@app/utilities/message';
import { UploadFileDto } from './dto/rest.dto';
import { IFileData } from '../../interfaces/rest.interface';

@Controller('rest')
export class RestController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
    private restService: RestService,
    private customUtility: Custom
  ) {}

  // @Post('upload_file')
  // // @UseInterceptors(
  // //   FileInterceptor('file_data', {
  // //     storage: diskStorage({
  // //       destination: './public/temp',
  // //       filename: FileService.editFileName,
  // //     }),
  // //     fileFilter: FileService.imageFileFilter,
  // //   })
  // // )
  // async uploadedFiles(@Body() body: any, @UploadedFile() file) {
  //   const reqparam = { ...body, ...file };
  //   console.log(reqparam);
  //   const result = {
  //     statusCode: HttpStatus.OK,
  //     message: '',
  //     success: 0,
  //     data: {},
  //   };
  //   result.success = 1;
  //   result.message = 'File uploaded successfully';
  //   result.data = {
  //     name: file.filename,
  //     url: file.filename,
  //     type: 'image',
  //     width: 50,
  //     height: 50,
  //   };
  //   return this.customUtility.getResponseTemplate(
  //     result.success,
  //     result.message,
  //     result.statusCode,
  //     result.data
  //   );
  // }

  @Post('upload_file')
  @UseInterceptors(FileInterceptor('file_data'))
  async uploadedFile(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File
  ): Promise<IApiResponse<IFileData>> {
    try {
      if (!file) {
        return this.customUtility.getResponseTemplate({
          success: SUCCESS.false,
          action: ACTIONS.FILE_NOT_PROVIDED, // Ensure you have a corresponding action for this case
          statusCode: HttpStatus.BAD_REQUEST,
          data: {},
        });
      }
      const reqparam = { ...body, ...file };

      const result = await this.restService.uploadFormFile(reqparam);

      const isSuccess: boolean = !!result ? true : false;

      return this.customUtility.getResponseTemplate({
        success: isSuccess ? SUCCESS.true : SUCCESS.false,
        action: isSuccess ? ACTIONS.FILE_UPLOADED : ACTIONS.NOT_UPLOAD,
        statusCode: isSuccess ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        data: isSuccess ? result : {},
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
