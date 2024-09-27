import { FileService } from '@app/services/services/file.service';
import { SettingsService } from '@app/services/services/settings.service';
import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql';

@Injectable()
export class CommonConfigService {
  constructor(
    private readonly settings: SettingsService,
    private fileService: FileService
  ) {}

  async connectToDatabaseViaURL(connectionUrl, tableName) {
    // Create a connection
    console.log('Connecting to the database', connectionUrl);
    const connection = mysql.createConnection(connectionUrl);

    try {
      const results = await new Promise((resolve, reject) => {
        // Connect to the database
        connection.connect((err) => {
          if (err) {
            console.error('Error connecting to the database:', err.stack);
            reject(err);
          } else {
            connection.query(`SELECT * FROM ${tableName}`, (error, results) => {
              if (error) {
                console.error('Error querying the database:', error.stack);
                reject(error);
              } else {
                // console.log('Query results:', results);
                resolve(results);
              }
            });
          }
        });
      });
      // Return the query results
      return results;
    } catch (error) {
      // Handle connection error
      console.error('Error connecting to the database:', error);
      throw error; // You might want to throw the error to handle it further up the call stack
    } finally {
      // Close the connection
      connection.end();
    }
  }

  async processAndValidateFile(inputFileName: string) {
    let fileInfo: any = {};
    const tmpUploadPath = await this.settings.getItem('upload_temp_path');
    // Check if the file exists in the temporary upload path
    if (this.fileService.isFile(`${tmpUploadPath}${inputFileName}`)) {
      // Initialize file info object
      fileInfo = {
        file_name: inputFileName,
        file_path: `${tmpUploadPath}${inputFileName}`,
        file_type: this.fileService.getFileMime(
          `${tmpUploadPath}${inputFileName}`
        ),
        file_size: this.fileService.getFileSize(
          `${tmpUploadPath}${inputFileName}`
        ),
        max_size: 102400,
        extensions: await this.settings.getItem('allowed_extensions'),
      };

      // Validate file format
      if (
        this.fileService.validateFileFormat(
          fileInfo.extensions,
          fileInfo.file_name
        )
      ) {
        // Validate file size
        if (
          this.fileService.validateFileSize(
            fileInfo.file_size,
            fileInfo.max_size
          )
        ) {
          // Assign name if file is valid
          fileInfo.name = inputFileName;
        } else {
          // Handle file size validation failure
          console.error('File size exceeds the maximum allowed limit.');
          fileInfo = null;
        }
      } else {
        // Handle file format validation failure
        console.error('File format is not allowed.');
        fileInfo = null;
      }
    } else {
      // Handle file not existing
      console.error('File does not exist.');
    }
    console.log(fileInfo);
    return fileInfo;
  }

  uploadFolderImage(uploadInfo: any) {
    const uploadResult = { success: false };
    if ('name' in uploadInfo) {
      const uploadConfig = {
        source: 'SYSTEM',
        upload_path: uploadInfo.folderName, //'profile_image/',
        extensions: uploadInfo.extensions,
        file_type: uploadInfo.file_type,
        file_size: uploadInfo.file_size,
        max_size: uploadInfo.max_size,
        src_file: uploadInfo.file_path,
        dst_file: uploadInfo.name,
      };

      console.log(uploadConfig);
      this.fileService.uploadFile(uploadConfig);
    }

    return uploadResult;
  }

  async getImageUrl(data: any, folderPath) {
    if (data) {
      const dataArray: any = Array.isArray(data) ? data : [data];
      // Process each object in the array
      const processedDataPromises = dataArray.map(async (obj) => {
        const fileConfig = {
          source: 'SYSTEM',
          path: folderPath,
          image_name: obj.imageUrl || obj.logoUrl || obj.documentUrl,
          extensions: await this.settings.getItem('allowed_extensions'),
          color: 'FFFFFF',
        };
        // Assuming 'fileService.getFile' returns a string URL for the image
        const updatedImageUrl = await this.fileService.getFile(fileConfig);
        if (obj.documentUrl) {
          return { ...obj, documentUrl: updatedImageUrl };
        } else {
          return { ...obj, imageUrl: updatedImageUrl };
        }
      });

      // Wait for all promises to resolve
      const processedData = await Promise.all(processedDataPromises);

      // Return data in its original format
      return Array.isArray(data) ? processedData : processedData[0];
    }
  }
}
