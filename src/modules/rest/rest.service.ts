import { Injectable } from '@nestjs/common';
import _ from 'underscore';
import { FileService } from '@app/services/services/file.service';
import { SettingsService } from '@app/services/services/settings.service';
import { IFileData } from '../../interfaces/rest.interface';

@Injectable()
export class RestService {
  constructor(
    private readonly settings: SettingsService,
    private fileService: FileService
  ) {}
  uploadFormFile = async (reqParams) => {
    let data: IFileData;

    try {
      //  const fieldName = reqParams.name;
      const fielData = reqParams;
      // if (!fieldName) {
      //   throw new Error('Field name is required');
      // }
      if (_.isEmpty(fielData)) {
        throw new Error('Upload file is missing');
      }

      console.log('fielData', fielData);

      const fileProp = await this.fileService.getFileAttributes(
        fielData.originalname
      );
      console.log('fileProp', fileProp);

      const uploadOptions = {
        source: 'local',
        upload_path: await this.settings.getItem('upload_temp_path'),
        src_file: fielData.buffer,
        dst_file: fileProp.file_name,
        extensions: 'gif,png,jpg,jpeg,jpe',
        file_type: fielData.mimetype,
        file_size: fielData.size,
        max_size: null,
      };

      const uploadResult: any =
        await this.fileService.uploadFile(uploadOptions);
      if (!uploadResult.success) {
        //this.log.error(`File upload failed. Error:${uploadResult.message}`);
        console.log('error', uploadResult.message);
      }
      data = {
        name: fileProp.file_name,
        url: `${await this.settings.getItem('upload_temp_url')}${
          fileProp.file_name
        }`,
        type: fileProp.file_cat,
        width: '',
        height: '',
      };

      return data;
    } catch (err) {
      //this.log.error('uploadFormFile >> Error:', err);
      console.log('uploadFormFile >> Error:', err);
    }
  };
}
