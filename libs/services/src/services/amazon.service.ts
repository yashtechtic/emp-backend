import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as S3 from 'aws-sdk/clients/s3';
import * as fse from 'fs-extra';

import { SettingsService } from './settings.service';
// import { log } from '../utilities/index';
@Injectable()
export class AmazonService {
  type;
  region;
  provider;
  constructor(private settings: SettingsService) {
    this.type = 'aws';
    //this.log = log;
  }

  setWasabi = () => {
    this.type = 'wasabi';
  };

  initialize = async () => {
    if (this.type === 'wasabi') {
      const wasabiEndpoint = new AWS.Endpoint('s3.wasabisys.com');
      this.provider = new S3({
        endpoint: wasabiEndpoint,
        accessKeyId: await this.settings.getItem('AWS_ACCESSKEY'),
        secretAccessKey: await this.settings.getItem('AWS_SECRECTKEY'),
        region: this.region,
      });
    } else {
      const awsRegion = await this.settings.getItem('AWS_END_POINT');
      this.region = awsRegion ? awsRegion.trim() : 'us-east-1';
      this.provider = new S3({
        accessKeyId: await this.settings.getItem('AWS_ACCESSKEY'),
        secretAccessKey: await this.settings.getItem('AWS_SECRECTKEY'),
        region: this.region,
      });
    }
  };

  createBucket = async (options) => {
    let success;
    let message;
    let response;
    try {
      this.initialize();
      const s3Client = this.provider;
      if ('async' in options && options.async === false) {
        response = new Promise((resolve, reject) => {
          s3Client.createBucket(
            {
              ACL: 'public-read',
              Bucket: options.bucket_name,
              CreateBucketConfiguration: {
                LocationConstraint: this.region,
              },
            },
            (error, data) => {
              if (error) {
                reject(error);
              } else {
                resolve(data);
              }
            }
          );
        });
      } else {
        s3Client.createBucket(
          {
            ACL: 'public-read',
            Bucket: options.bucket_name,
            CreateBucketConfiguration: {
              LocationConstraint: this.region,
            },
          },
          (error, data) => {
            if (error) {
              //this.log.error('Create Bucket Error: ', error);
              console.log('Create Bucket Error: ', error);
            }
          }
        );
      }

      success = 1;
      message = 'Bucket created successfully.';
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

  deleteBucket = async (options) => {
    let success;
    let message;
    let response;
    try {
      this.initialize();
      const s3Client = this.provider;
      if ('async' in options && options.async === false) {
        response = new Promise((resolve, reject) => {
          s3Client.deleteBucket(
            {
              Bucket: options.bucket_name,
            },
            (error, data) => {
              if (error) {
                reject(error);
              } else {
                resolve(data);
              }
            }
          );
        });
      } else {
        s3Client.deleteBucket(
          {
            Bucket: options.bucket_name,
          },
          (error, data) => {
            if (error) {
              //  this.log.error('Delete Bucket Error: ', error);
              console.log(error);
            }
          }
        );
      }

      success = 1;
      message = 'Bucket created successfully.';
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

  checkBucket = async (options) => {
    let success;
    let message;
    let response;
    try {
      this.initialize();
      const s3Client = this.provider;
      if ('async' in options && options.async === false) {
        response = new Promise((resolve, reject) => {
          s3Client.headBucket(
            {
              Bucket: options.bucket_name,
            },
            (error, data) => {
              if (error) {
                reject(error);
              } else {
                resolve(data);
              }
            }
          );
        });
      } else {
        s3Client.headBucket(
          {
            Bucket: options.bucket_name,
          },
          (error, data) => {
            if (error) {
              // this.log.error('Check Bucket Error: ', error);
              console.log('Check Bucket Error: ', error);
            }
          }
        );
      }

      success = 1;
      message = 'Bucket status retrieved.';
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

  checkFile = async (options) => {
    let success;
    let message;
    let response;
    try {
      this.initialize();
      const s3Client = this.provider;
      if ('async' in options && options.async === false) {
        response = new Promise((resolve, reject) => {
          s3Client.headObject(
            {
              Bucket: options.bucket_name,
              Key: options.file_name,
            },
            (error, data) => {
              if (error) {
                reject(error);
              } else {
                resolve(data);
              }
            }
          );
        });
      } else {
        s3Client.headObject(
          {
            Bucket: options.bucket_name,
            Key: options.file_name,
          },
          (error, data) => {
            if (error) {
              // this.log.error('Check File Error: ', error);
              console.log('Check File Error: ', error);
            }
          }
        );
      }

      success = 1;
      message = 'Bucket status retrieved.';
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

  uploadFile = async (options) => {
    let success;
    let message;
    let response;
    try {
      await this.initialize();
      const s3Client = this.provider;
      const sizeOpts = {
        partSize: 10 * 1024 * 1024,
        queueSize: 5,
      };
      if ('async' in options && options.async === false) {
        response = new Promise((resolve, reject) => {
          s3Client.upload(
            {
              ACL: 'public-read',
              Bucket: options.bucket_name,
              Key: options.file_name,
              Body: fse.createReadStream(options.file_path),
              ContentType: options.mime_type,
              ContentLength: options.file_size,
            },
            sizeOpts,
            (error, data) => {
              if (error) {
                reject(error);
              } else {
                resolve(data);
              }
            }
          );
        });
      } else {
        s3Client.upload(
          {
            ACL: 'public-read',
            Bucket: options.bucket_name,
            Key: options.file_name,
            Body: fse.createReadStream(options.file_path),
            ContentType: options.mime_type,
            ContentLength: options.file_size,
          },
          sizeOpts,
          (error, data) => {
            if (error) {
              // this.log.error('Upload File Error: ', error);
              console.log('Upload File Error: ', error);
            }
          }
        );
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

  deleteFile = async (options) => {
    let success;
    let message;
    let response;
    try {
      this.initialize();
      const s3Client = this.provider;
      if ('async' in options && options.async === false) {
        response = new Promise((resolve, reject) => {
          s3Client.deleteObject(
            {
              Bucket: options.bucket_name,
              Key: options.file_name,
            },
            (error, data) => {
              if (error) {
                reject(error);
              } else {
                resolve(data);
              }
            }
          );
        });
      } else {
        s3Client.deleteObject(
          {
            Bucket: options.bucket_name,
            Key: options.file_name,
          },
          (error, data) => {
            if (error) {
              // this.log.error('Delete File Error: ', error);
              console.log('Delete File Error: ', error);
            }
          }
        );
      }

      success = 1;
      message = 'File deleted successfully.';
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

  deleteFiles = async (options) => {
    let success;
    let message;
    let response;
    try {
      // options.file_names:
      // [
      //   { Key: "objectkey1" },
      //   { Key: "objectkey2" },
      // ]
      this.initialize();
      const s3Client = this.provider;
      if ('async' in options && options.async === false) {
        response = new Promise((resolve, reject) => {
          s3Client.deleteObject(
            {
              Bucket: options.bucket_name,
              Delete: {
                Objects: options.file_names,
              },
            },
            (error, data) => {
              if (error) {
                reject(error);
              } else {
                resolve(data);
              }
            }
          );
        });
      } else {
        s3Client.deleteObject(
          {
            Bucket: options.bucket_name,
            Delete: {
              Objects: options.file_names,
            },
          },
          (error, data) => {
            if (error) {
              //this.log.error('Delete Files Error: ', error);
              console.log('Delete Files Error: ', error);
            }
          }
        );
      }

      success = 1;
      message = 'Files deleted successfully.';
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

  downloadFile = async (options) => {
    let success;
    let message;
    let response;
    try {
      this.initialize();
      const s3Client = this.provider;
      if ('async' in options && options.async === false) {
        response = new Promise((resolve, reject) => {
          s3Client.getObject(
            {
              Bucket: options.bucket_name,
              Key: options.file_name,
            },
            (error, data) => {
              if (error) {
                reject(error);
              } else {
                resolve(data);
              }
            }
          );
        });
      } else {
        s3Client.getObject(
          {
            Bucket: options.bucket_name,
            Key: options.file_name,
          },
          (error, data) => {
            if (error) {
              //this.log.error('Download File Error: ', error);
              console.log('Download File Error: ', error);
            }
          }
        );
      }

      success = 1;
      message = 'File downloaded successfully.';
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

  getBucketFiles = async (options) => {
    let success;
    let message;
    let response;
    try {
      this.initialize();
      const s3Client = this.provider;
      const listOpts = {
        Bucket: options.bucket_name,
      };
      if (options.prefix) {
        listOpts['Prefix'] = options.prefix;
      }
      if (options.max_keys > 0) {
        listOpts['MaxKeys'] = options.max_keys;
      }
      if (options.start_after > 0) {
        listOpts['StartAfter'] = options.start_after;
      }
      if (options.continuation_token > 0) {
        listOpts['ContinuationToken'] = options.continuation_token;
      }
      if ('async' in options && options.async === false) {
        response = new Promise((resolve, reject) => {
          s3Client.listObjectsV2(listOpts, (error, data) => {
            if (error) {
              reject(error);
            } else {
              resolve(data);
            }
          });
        });
      } else {
        s3Client.listObjectsV2(listOpts, (error, data) => {
          if (error) {
            // this.log.error('Bucket Files Error: ', error);
            console.log('Bucket Files Error: ', error);
          }
        });
      }

      success = 1;
      message = 'File downloaded successfully.';
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
}
