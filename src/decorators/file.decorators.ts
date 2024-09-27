import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function MaxFileSize(
  maxSize: number,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'maxFileSize',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [maxSize],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value || !Array.isArray(value)) {
            return true;
          }

          const files: Express.Multer.File[] = value;
          const maxFileSize: number = args.constraints[0];

          for (const file of files) {
            if (file.size > maxFileSize) {
              return false;
            }
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const maxFileSize: number = args.constraints[0];
          return `File size should not exceed ${maxFileSize} bytes`;
        },
      },
    });
  };
}

export function IsFileMimeType(
  allowedMimeTypes: string[],
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFileMimeType',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [allowedMimeTypes],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value || !Array.isArray(value)) {
            return true;
          }

          const files: Express.Multer.File[] = value;
          const allowedTypes: string[] = args.constraints[0];

          for (const file of files) {
            if (!allowedTypes.includes(file.mimetype)) {
              return false;
            }
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const allowedTypes: string[] = args.constraints[0];
          return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
        },
      },
    });
  };
}
