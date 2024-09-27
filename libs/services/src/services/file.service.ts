/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'underscore';
import url from 'url';
import * as path from 'path';
import { lookup } from 'mime-types';
import * as fse from 'fs-extra';
// import sharp from 'sharp';
import * as crypto from 'crypto';
import { Base64 } from 'js-base64';
import * as sharp from 'sharp';

import { AmazonService } from './amazon.service';
import { DateService } from './date.service';
import { SettingsService } from './settings.service';
import { Injectable } from '@nestjs/common';
import { Custom } from '@app/utilities/custom.utility';

@Injectable()
export class FileService {
  constructor(
    private amazonService: AmazonService,
    private dateService: DateService,
    private settings: SettingsService,
    private customUtility: Custom
  ) {}

  isFile = (filePath) => {
    let fileFlag: any;
    try {
      const fileStats = fse.statSync(filePath);
      fileFlag = !!fileStats.isFile();
    } catch (err) {
      fileFlag = false;
    }
    return fileFlag;
  };

  isDirectory = (dirPath) => {
    let dirFlag;
    try {
      const dirStats = fse.statSync(dirPath);
      dirFlag = !!dirStats.isDirectory();
    } catch (err) {
      dirFlag = false;
    }
    return dirFlag;
  };

  getFileSize = (filePath) => {
    let fileSize;
    try {
      const fileStats = fse.statSync(filePath);
      fileSize = fileStats.size;
    } catch (err) {
      fileSize = -1;
    }
    return fileSize;
  };

  getFileMime = (filePath: any) => lookup(filePath);

  readURLName = (fileUrl: any) => {
    const parsed = url.parse(fileUrl);
    return path.basename(parsed.pathname);
  };

  //   writeURLData = async (fileUrl, filePath) => {
  //     const response = await gotService.stream(fileUrl, filePath, {}, {});
  //     if (response.success) {
  //       return true;
  //     }
  //     return false;
  //   };

  readFile = (filePath, options) => {
    let result;
    if ('async' in options && options.async === true) {
      fse.readFile(filePath, options.callback);
    } else {
      result = fse.readFileSync(filePath);
    }
    return result;
  };

  writeFile = (filePath, data, options) => {
    let result;
    if ('async' in options && options.async === false) {
      result = fse.writeFileSync(filePath, data);
    } else {
      fse.writeFile(filePath, data, (err) => {
        if (err) {
          //this.log.error('Create File Error: ', err);
          console.log('Create File Error: ', err);
        }
      });
    }
    return result;
  };

  deleteFile = (filePath, options) => {
    let result;
    if ('async' in options && options.async === false) {
      result = fse.removeSync(filePath);
    } else {
      fse.remove(filePath, (err) => {
        if (err) {
          //  this.log.error('Delete File Error: ', err);
          console.log('Delete File Error: ', err);
        }
      });
    }
    return result;
  };

  getNoImageUrl = async (noImageVal) => {
    const uploadServer = await this.settings.getItem(
      'FILE_UPLOAD_SERVER_LOCATION'
    );
    const settingsConfig = await this.settings.getItem('settings_files_config');
    const uploadFolder = settingsConfig.upload_folder;
    const awsVarsList = settingsConfig.aws_vars_list;

    if (!noImageVal) {
      noImageVal = await this.settings.getItem('UPLOAD_NOIMAGE');
    }
    let noImageUrl = `${await this.settings.getItem(
      'settings_files_url'
    )}noimage.png`;
    if (noImageVal) {
      if (uploadServer === 'amazon' && awsVarsList.includes('UPLOAD_NOIMAGE')) {
        const awsPathInfo: any = this.getAmazonUploadPathURL(uploadFolder);
        if (awsPathInfo.folder_url) {
          noImageUrl = `${awsPathInfo.folder_url}${noImageVal}`;
        } else {
          const locNoImagePath = `${await this.settings.getItem(
            'settings_files_path'
          )}${noImageVal}`;
          if (this.isFile(locNoImagePath)) {
            noImageUrl = `${await this.settings.getItem(
              'settings_files_url'
            )}${noImageVal}`;
          }
        }
      } else {
        const locNoImagePath = `${await this.settings.getItem(
          'settings_files_path'
        )}${noImageVal}`;
        if (this.isFile(locNoImagePath)) {
          noImageUrl = `${await this.settings.getItem(
            'settings_files_url'
          )}${noImageVal}`;
        }
      }
    }
    return noImageUrl;
  };

  staticImageUrl = async (options) => {
    let defaultImage = '';
    if (!('no_img_req' in options && options.no_img_req === false)) {
      const allowedExtList = await this.settings.getItem('allowed_extensions');
      const defaultExtList = allowedExtList.split(',');
      const optionsExtList = options.extensions
        ? options.extensions.split(',')
        : [];
      const intersectList = _.intersection(defaultExtList, optionsExtList);
      if (_.isArray(intersectList) && intersectList.length > 0) {
        defaultImage = await this.getNoImageUrl(options.no_img_val);
      }
    }
    return defaultImage;
  };

  getResizeImageUrl = async (imgUrl, width, height, options) => {
    const resizeObj: any = {};
    const edits: any = {};
    const flatten: any = {};
    const resizeMode = options.resize_mode || 'cover';

    const resize: any = {};
    resize.width = Number(width) || null;
    resize.height = Number(height) || null;
    resize.fit = resizeMode;
    if (options.color) {
      resize.background = this.hexToRgb(options.color, 1);
    }
    edits.resize = resize;

    resizeObj.edits = edits;
    if (options.background) {
      flatten.background = this.hexToRgb(options.background, 1);
      resizeObj.flatten = flatten;
    }
    let resizeUrl = '';
    if (options.source === 'amazon') {
      resizeObj.bucket = await this.settings.getItem('AWS_BUCKET_NAME');
      resizeObj.key = `${options.path}/${options.image_name}`;
      const encData = Base64.encode(JSON.stringify(resizeObj));
      const sslVerify = await this.settings.getItem('AWS_SSL_VERIFY');
      const domain = await this.settings.getItem('AWS_IMG_HANDLER_DOMAIN');
      const protocol = sslVerify === 'Y' ? 'https://' : 'http://';
      resizeUrl = `${protocol}${domain}/${encData}`;
    } else {
      resizeObj.img_url = imgUrl;
      const encData = Base64.encode(JSON.stringify(resizeObj));
      resizeUrl = `${await this.settings.getItem(
        'api_url'
      )}/api/rest/image_resize/${encData}`;
    }

    return resizeUrl;
  };

  hexToRgb = (hex, alpha) => {
    let r = 0;
    let g = 0;
    let b = 0;

    if (hex) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
    const rgba = {
      r,
      g,
      b,
      alpha,
    };
    return rgba;
  };

  getResizedImage = async (options) => {
    // const flatten = {};
    // flatten.background = (options.flatten.background) || { r: 0, g: 0, b: 0 };
    await sharp(options.src_path)
      .resize(options.edits.resize.width, options.edits.resize.height, {
        fit: options.edits.resize.fit,
        background: options.edits.resize.background,
      })
      // .flatten(flatten)
      .toFile(options.dst_path)
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .then(() => {});

    return true;
  };

  getFile = async (options) => {
    let fileUrl = '';
    let fileSrc = options.source;
    if (fileSrc.toUpperCase() === 'SYSTEM') {
      fileSrc = await this.settings.getItem('FILE_UPLOAD_SERVER_LOCATION');
    }
    switch (fileSrc) {
      case 'amazon':
        fileUrl = await this.getAmazonFile(options);
        break;
      case 'wasabi':
        fileUrl = await this.getWasabiFile(options);
        break;
      default:
        fileUrl = await this.getLocalFile(options);
        break;
    }
    return fileUrl;
  };

  getLocalFile = async (options) => {
    // $options['pk']         options.nested_key
    // $options['image_name'] options.image_name
    // $options['ext']        options.extensions
    // $options['no_img']     options.no_img_req
    //                        options.no_img_val
    // $options['width']      options.width
    // $options['height']     options.height
    // $options['path']       options.path
    // $options['color']      options.color
    //                        options.fit
    let finalFileUrl;
    const fileName = options.image_name;
    if (fileName && this.customUtility.isExternalURL(fileName)) {
      if ('width' in options || 'height' in options) {
        finalFileUrl = await this.getResizeImageUrl(
          fileName,
          options.width,
          options.height,
          options
        );
      } else {
        finalFileUrl = fileName;
      }
    } else {
      const defaultImage = this.staticImageUrl(options);
      const locFinalPath: any = await this.getUploadNestedFolders(options.path);
      const locPathInfo: any = await this.getLocalUploadPathURL(locFinalPath);

      if (fileName && locPathInfo.folder_url) {
        let tmpFilePath = '';
        let tmpFileUrl = '';
        if ('nested_key' in options && options.nested_key) {
          const separator = await this.settings.getItem('separator');
          tmpFilePath = `${locPathInfo.folder_path}${options.nested_key}${separator}${fileName}`;
          tmpFileUrl = `${locPathInfo.folder_url}${options.nested_key}/${fileName}`;
        } else {
          tmpFilePath = `${locPathInfo.folder_path}${fileName}`;
          tmpFileUrl = `${locPathInfo.folder_url}${fileName}`;
        }
        if (this.isFile(tmpFilePath)) {
          if ('width' in options || 'height' in options) {
            finalFileUrl = await this.getResizeImageUrl(
              tmpFileUrl,
              options.width,
              options.height,
              options
            );
          } else {
            finalFileUrl = tmpFileUrl;
          }
        }
      }
      if (!finalFileUrl) {
        if (defaultImage && ('width' in options || 'height' in options)) {
          finalFileUrl = await this.getResizeImageUrl(
            defaultImage,
            options.width,
            options.height,
            options
          );
        } else {
          finalFileUrl = defaultImage;
        }
      }
    }

    return finalFileUrl;
  };

  getAmazonFile = async (options) => {
    let finalFileUrl = '';
    const fileName = options.image_name;
    if (fileName && this.customUtility.isExternalURL(fileName)) {
      if ('width' in options || 'height' in options) {
        finalFileUrl = await this.getResizeImageUrl(
          fileName,
          options.width,
          options.height,
          options
        );
      } else {
        finalFileUrl = fileName;
      }
    } else {
      const defaultImage: any = this.staticImageUrl(options);
      const awsPathInfo: any = await this.getAmazonUploadPathURL(options.path);

      if (fileName && awsPathInfo.folder_url) {
        let tmpFileUrl = '';
        if ('nested_key' in options && options.nested_key) {
          tmpFileUrl = `${awsPathInfo.folder_url}${options.nested_key}/${fileName}`;
        } else {
          tmpFileUrl = `${awsPathInfo.folder_url}${fileName}`;
        }
        if ('width' in options || 'height' in options) {
          finalFileUrl = await this.getResizeImageUrl(
            tmpFileUrl,
            options.width,
            options.height,
            options
          );
        } else {
          finalFileUrl = tmpFileUrl;
        }
      }
      if (!finalFileUrl) {
        if (defaultImage && ('width' in options || 'height' in options)) {
          finalFileUrl = await this.getResizeImageUrl(
            defaultImage,
            options.width,
            options.height,
            options
          );
        } else {
          finalFileUrl = defaultImage;
        }
      }
    }
    return finalFileUrl;
  };

  getWasabiFile = async (options) => {
    let finalFileUrl = '';
    const fileName = options.image_name;
    if (fileName && this.customUtility.isExternalURL(fileName)) {
      if ('width' in options || 'height' in options) {
        finalFileUrl = await this.getResizeImageUrl(
          fileName,
          options.width,
          options.height,
          options
        );
      } else {
        finalFileUrl = fileName;
      }
    } else {
      const defaultImage: any = await this.staticImageUrl(options);
      const wasabiPathInfo: any = this.getWasabiUploadPathURL(options.path);
      if (fileName && wasabiPathInfo.folder_url) {
        let tmpFileUrl = '';
        if ('nested_key' in options && options.nested_key) {
          tmpFileUrl = `${wasabiPathInfo.folder_url}${options.nested_key}/${fileName}`;
        } else {
          tmpFileUrl = `${wasabiPathInfo.folder_url}${fileName}`;
        }
        if ('width' in options || 'height' in options) {
          finalFileUrl = await this.getResizeImageUrl(
            tmpFileUrl,
            options.width,
            options.height,
            options
          );
        } else {
          finalFileUrl = tmpFileUrl;
        }
      }
      if (!finalFileUrl) {
        if (defaultImage && ('width' in options || 'height' in options)) {
          finalFileUrl = await this.getResizeImageUrl(
            defaultImage,
            options.width,
            options.height,
            options
          );
        } else {
          finalFileUrl = defaultImage;
        }
      }
    }
    return finalFileUrl;
  };

  uploadFile = async (options) => {
    let result = {};
    let uploadSrc = options.source;
    if (uploadSrc.toUpperCase() === 'SYSTEM') {
      uploadSrc = await this.settings.getItem('FILE_UPLOAD_SERVER_LOCATION');
      if (uploadSrc === 'local') {
        const uploadPath = await this.settings.getItem('upload_path');
        options.upload_path = `${uploadPath}${options.upload_path}`;
      }
    }
    switch (uploadSrc) {
      case 'amazon':
        result = await this.uploadAmazonFile(options);
        break;
      case 'wasabi':
        result = await this.uploadWasabiFile(options);
        break;
      default:
        result = await this.uploadLocalFile(options);
        break;
    }
    return result;
  };

  uploadLocalFile = async (options) => {
    let success;
    let message;

    try {
      const uploadPath = options.upload_path;
      const tmpFile = options.src_file;
      const dstFile = options.dst_file;

      if (!dstFile) {
        throw new Error('Upload file not found.');
      }
      if ('extensions' in options && options.extensions) {
        if (!this.validateFileFormat(options.extensions, dstFile)) {
          throw new Error(
            `File extension is not valid. Vaild extensions are ${options.extensions}.`
          );
        }
      }
      if ('max_size' in options && options.max_size > 0) {
        if (!this.validateFileSize(options.file_size, options.max_size)) {
          throw new Error(
            `File size is not valid. Maximum upload file size is ${options.max_size} KB.`
          );
        }
      }
      if (!this.isDirectory(uploadPath)) {
        this.createFolder(uploadPath, {});
      }
      const dstPath = `${uploadPath}${dstFile}`;
      if ('async' in options && options.async === true) {
        fse.copy(tmpFile, dstPath, async (err1) => {
          if (err1) {
            return false;
          }
          if (
            tmpFile.startsWith(await this.settings.getItem('upload_temp_path'))
          ) {
            fse.remove(tmpFile, (err2) => {
              if (err2) {
                return false;
              }
              return true;
            });
          }
          return true;
        });
      } else {
        if (Buffer.isBuffer(tmpFile)) {
          const outStream = fse.createWriteStream(dstPath);
          outStream.write(tmpFile);
        } else {
          fse.copySync(tmpFile, dstPath);
          if (
            tmpFile.startsWith(await this.settings.getItem('upload_temp_path'))
          ) {
            fse.removeSync(tmpFile);
          }
        }
      }
      success = 1;
      message = 'File uploaded successfully.';
    } catch (err) {
      success = 0;
      message = err;
    }
    return {
      success,
      message,
    };
  };

  uploadAmazonFile = async (options) => {
    let success;
    let message;
    let response;
    try {
      const uploadPath = options.upload_path;
      const tmpFile = options.src_file;
      const dstFile = options.dst_file;

      if (!dstFile || !this.isFile(tmpFile)) {
        throw new Error('Upload file not found.');
      }
      if ('extensions' in options && options.extensions) {
        if (!this.validateFileFormat(options.extensions, dstFile)) {
          throw new Error(
            `File extension is not valid. Vaild extensions are ${options.extensions}.`
          );
        }
      }
      if ('max_size' in options && options.max_size > 0) {
        if (!this.validateFileSize(options.file_size, options.max_size)) {
          throw new Error(
            `File size is not valid. Maximum upload file size is ${options.max_size} KB.`
          );
        }
      }

      const dstPath = `${uploadPath}${dstFile}`;
      let mimeType = lookup(tmpFile);
      mimeType = mimeType || options.file_type;
      const awsOpts = {
        async: options.async || true,
        bucket_name: await this.settings.getItem('AWS_BUCKET_NAME'),
        file_path: tmpFile,
        file_name: dstPath,
        mime_type: mimeType,
        file_size: this.getFileSize(tmpFile),
      };

      if ('async' in options && options.async === false) {
        response = await this.amazonService.uploadFile(awsOpts);
      } else {
        response = await this.amazonService.uploadFile(awsOpts);
      }

      success = 1;
      message = 'File uploaded successfully.';
    } catch (err) {
      success = 0;
      message = err;
    }
    return {
      success,
      message,
      response,
    };
  };

  uploadWasabiFile = async (options) => {
    let success;
    let message;
    let response;
    try {
      const uploadPath = options.upload_path;
      const tmpFile = options.src_file;
      const dstFile = options.dst_file;

      if (!dstFile || !this.isFile(tmpFile)) {
        throw new Error('Upload file not found.');
      }
      if ('extensions' in options && options.extensions) {
        if (!this.validateFileFormat(options.extensions, dstFile)) {
          throw new Error(
            `File extension is not valid. Vaild extensions are ${options.extensions}.`
          );
        }
      }
      if ('max_size' in options && options.max_size > 0) {
        if (!this.validateFileSize(options.file_size, options.max_size)) {
          throw new Error(
            `File size is not valid. Maximum upload file size is ${options.max_size} KB.`
          );
        }
      }

      const dstPath = `${uploadPath}${dstFile}`;
      const awsOpts = {
        async: options.async,
        bucket_name: await this.settings.getItem('AWS_BUCKET_NAME'),
        file_path: tmpFile,
        file_name: dstPath,
        mime_type: lookup(tmpFile),
        file_size: this.getFileSize(tmpFile),
      };

      this.amazonService.setWasabi();
      if ('async' in options && options.async === false) {
        response = await this.amazonService.uploadFile(awsOpts);
      } else {
        response = this.amazonService.uploadFile(awsOpts);
      }

      success = 1;
      message = 'File uploaded successfully.';
    } catch (err) {
      success = 0;
      message = err;
    }
    return {
      success,
      message,
      response,
    };
  };

  imageUpload = (options, params) => {
    let success;
    let message;
    try {
      const uploadPath = options.upload_path;
      const imageData = options.image_data;
      let dstFile = options.dst_file;
      const cleanSource = this.cleanBase64ImageData(imageData);
      const imageSource = Base64.decode(cleanSource);
      if (!dstFile) {
        const tmpName = `base-image-${this.dateService.getCurrentTimeMS()}--${crypto.randomBytes(4).toString('hex').slice(0, 7)}`;
        dstFile = `${this.sanitizeFileName(tmpName)}.jpg`;
      }
      if (!this.isDirectory(uploadPath)) {
        this.createFolder(uploadPath, {});
      }
      const dstPath = `${uploadPath}${dstFile}`;

      if ('async' in options && options.async === true) {
        fse.outputFile(dstPath, imageSource, (err1) => {
          if (err1) {
            return false;
          }
          return true;
        });
      } else {
        fse.outputFileSync(dstPath, imageSource);
      }

      success = 1;
      message = 'File created successfully.';
    } catch (err) {
      success = 0;
      message = err;
    }
    return {
      success,
      message,
    };
  };

  getLocalUploadPathURL = async (folderName) => {
    const uploadPathInfo: any = {};
    const uploadPath = await this.settings.getItem('upload_path');
    const uploadUrl = await this.settings.getItem('upload_url');
    folderName = folderName ? folderName.trim() : '';
    if (folderName === '') {
      uploadPathInfo.folder_name = folderName;
      uploadPathInfo.folder_path = '';
      uploadPathInfo.folder_url = '';
    } else {
      const folderPath = await this.getUploadNestedFolders(folderName);
      uploadPathInfo.folder_name = folderName;
      uploadPathInfo.folder_path = `${uploadPath}${folderPath}/`;
      uploadPathInfo.folder_url = `${uploadUrl}${folderName}/`;
    }
    return uploadPathInfo;
  };

  getAmazonUploadPathURL = async (folderName) => {
    const uploadPathInfo: any = {};
    folderName = folderName.trim();
    const bucketName = await this.settings.getItem('AWS_BUCKET_NAME');
    if (folderName === '' || bucketName === '') {
      uploadPathInfo.bucket_name = bucketName;
      uploadPathInfo.folder_name = folderName;
      uploadPathInfo.folder_path = '';
      uploadPathInfo.folder_url = '';
    } else {
      const awsCDNEnable = await this.settings.getItem('AWS_CDN_ENABLE');
      const awsCDNDomain = await this.settings.getItem('AWS_CDN_DOMAIN');
      const awsSSLVerify = await this.settings.getItem('AWS_SSL_VERIFY');
      const awsProtocal = awsSSLVerify === 'Y' ? 'https' : 'http';

      uploadPathInfo.bucket_name = bucketName;
      uploadPathInfo.folder_name = folderName;
      uploadPathInfo.folder_path = folderName;
      if (awsCDNEnable === 'Y') {
        uploadPathInfo.folder_url = `${awsProtocal}://${awsCDNDomain}/${folderName}/`;
      } else {
        uploadPathInfo.folder_url = `${awsProtocal}://${bucketName}.s3.amazonaws.com/${folderName}/`;
      }
    }
    return uploadPathInfo;
  };

  getWasabiUploadPathURL = async (folderName) => {
    const uploadPathInfo: any = {};
    folderName = folderName.trim();
    const bucketName = await this.settings.getItem('AWS_BUCKET_NAME');
    if (folderName === '' || bucketName === '') {
      uploadPathInfo.bucket_name = bucketName;
      uploadPathInfo.folder_name = folderName;
      uploadPathInfo.folder_path = '';
      uploadPathInfo.folder_url = '';
    } else {
      const awsSSLVerify = await this.settings.getItem('AWS_SSL_VERIFY');
      const awsProtocal = awsSSLVerify === 'Y' ? 'https' : 'http';

      uploadPathInfo.bucket_name = bucketName;
      uploadPathInfo.folder_name = folderName;
      uploadPathInfo.folder_path = folderName;
      uploadPathInfo.folder_url = `${awsProtocal}://s3.wasabisys.com/${bucketName}/${folderName}/`;
    }
    return uploadPathInfo;
  };

  getFileAttributes = async (fileName) => {
    try {
      const result: any = {};
      if (!fileName) {
        const tmpName = `base-image-${this.dateService.getCurrentTimeMS()}-${crypto.randomBytes(4).toString('hex').slice(0, 7)}`;
        result.file_ext = 'jpg';
        result.file_name = `${this.sanitizeFileName(tmpName)}.${result.file_ext}`;
      } else {
        const fileInfo = path.parse(fileName);
        const finalName = fileInfo.name
          .replace(/ /g, '_')
          .replace(/[^A-Za-z0-9@.-_]/g, '');

        const tmpName = `${finalName}-${this.dateService.getCurrentTimeMS()}-${crypto.randomBytes(4).toString('hex').slice(0, 7)}`;
        result.file_ext = fileInfo.ext.slice(1).toLowerCase();
        result.file_name = `${this.sanitizeFileName(tmpName)}.${result.file_ext}`;
      }
      const allowedExtList = await this.settings.getItem('allowed_extensions');
      const defaultExtList = allowedExtList.split(',');
      if (defaultExtList.includes(result.file_ext)) {
        result.file_cat = 'image';
      } else {
        result.file_cat = 'file';
      }
      return result;
    } catch (err) {
      console.log('=================', err);
      return null;
    }
  };

  getBase64ImageName = (imageData) => {
    imageData = imageData || '';
    const extension = imageData.substring(
      'data:image/'.length,
      imageData.indexOf(';base64')
    );
    const tmpName = `base-image-${this.dateService.getCurrentTimeMS()}-${crypto.randomBytes(4).toString('hex').slice(0, 7)}`;
    const fileName = `${this.sanitizeFileName(tmpName)}.${extension}`;
    return fileName;
  };

  cleanBase64ImageData = (imageData) => {
    let imageSource = imageData || '';
    imageSource = imageSource.replace(' ', '+');
    imageSource = imageSource.replace('data:image/jpeg;base64,', '');
    imageSource = imageSource.replace('data:image/png;base64,', '');
    return imageSource;
  };

  createFolder = (dirPath, mode) => {
    const desiredMode = mode || 0o2777;
    fse.ensureDirSync(dirPath, desiredMode);
  };

  setPermission = (filePath, mode) => {
    const desiredMode = mode || 0o2777;
    if (this.isFile(filePath)) {
      fse.chmod(filePath, desiredMode);
      return true;
    }
    return false;
  };

  createUploadFolder = async (folderName) => {
    if (folderName === '') {
      return false;
    }
    const uploadFolder = `${await this.settings.getItem(
      'upload_path'
    )}${folderName}/`;
    this.createFolder(uploadFolder, {});
    return true;
  };

  getUploadNestedFolders = async (folderName) => {
    if (folderName.indexOf('/') >= 0) {
      const folderNameList = folderName.split('/');
      folderName = folderNameList.join(
        await this.settings.getItem('separator')
      );
    }
    return folderName;
  };

  validateFileFormat = (allowedExt, uploadFile) => {
    const checkExt = allowedExt.split(',');
    const imageExt = path.extname(uploadFile).slice(1).toLowerCase();
    return checkExt.includes(imageExt);
  };

  validateFileSize = (fileSize, maxSize) => {
    const fileSizeKB = Math.ceil(fileSize / 1024);
    return fileSizeKB <= maxSize;
  };

  sanitizeFileName = (fileName) =>
    crypto.createHash('sha1').update(fileName, 'utf8').digest('hex');

  imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  };

  editFileName = (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = path.extname(file.originalname);
    const randomName = Array(4)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    callback(null, `${name}-${randomName}${fileExtName}`);
  };
}
