import {
  FormContentDto1,
  FormContentDto2,
  FormContentDto3,
  FormContentDto4,
} from '@app/modules/user-group/dto/user-group.dto';
import {
  registerDecorator,
  validateSync,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function PasswordMatch(
  property: string,
  flag: string,
  message: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property, message, flag],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${relatedPropertyName} and confirm ${relatedPropertyName} must match`;
        },
      },
    });
  };
}

export function DateEqualTo(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [start_date] = args.constraints;
          return `${start_date} and  end_date must match`;
        },
      },
    });
  };
}

export function DateGreaterThan(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value > relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [start_date] = args.constraints;
          return `end_date must greater than ${start_date} `;
        },
      },
    });
  };
}

export function DateLessThan(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value > relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [start_date] = args.constraints;
          return `${start_date} must be less than end_date`;
        },
      },
    });
  };
}

export function DateGreaterEqual(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value >= relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [start_date] = args.constraints;
          return `end_date greater than or equal to ${start_date}`;
        },
      },
    });
  };
}

export function DateLessEqual(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value >= relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [start_date] = args.constraints;
          return `${start_date}  less than or equal to end_date`;
        },
      },
    });
  };
}

export function NumEqualTo(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          console.log(value);
          console.log(args);
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [number] = args.constraints;
          return `${number} and re_enter_number are must equal`;
        },
      },
    });
  };
}

export function NumLessEqual(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          console.log(value);
          console.log(args);
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value >= relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [number] = args.constraints;
          return `${number} less than or equal to re_enter_number`;
        },
      },
    });
  };
}

export function NumGreaterEqual(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          console.log(value);
          console.log(args);
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value <= relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [number] = args.constraints;
          return `${number} greater than or equal to re_enter_number`;
        },
      },
    });
  };
}

export function NumLessThan(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          console.log(value);
          console.log(args);
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value > relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [number] = args.constraints;
          return `${number} less than re_enter_number`;
        },
      },
    });
  };
}

export function NumGreaterThan(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value < relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [number] = args.constraints;
          return `${number} greater than re_enter_number`;
        },
      },
    });
  };
}

export function TimeEqualTo(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [start_time] = args.constraints;
          return `${start_time} and end_time are must be equal`;
        },
      },
    });
  };
}

export function TimeLessThan(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value > relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [start_time] = args.constraints;
          return `${start_time} less than end_time`;
        },
      },
    });
  };
}

export function TimeLessEqual(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          console.log(value);
          console.log(relatedValue);
          return value >= relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [start_time] = args.constraints;
          return `${start_time} less than  or equal to end_time`;
        },
      },
    });
  };
}

export function TimeGreaterThan(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          console.log(value);
          console.log(relatedValue);
          return value < relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [start_time] = args.constraints;
          return `${start_time} greater than end_time`;
        },
      },
    });
  };
}

export function TimeGreaterEqual(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          console.log(value);
          console.log(relatedValue);
          return value <= relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [start_time] = args.constraints;
          return `${start_time} greater than or equal to end_time`;
        },
      },
    });
  };
}

export function NotEquals(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          return value !== relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [start_time] = args.constraints;
          return `${start_time} greater than or equal to end_time`;
        },
      },
    });
  };
}

export function Equals(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [start_time] = args.constraints;
          return `${start_time} greater than or equal to end_time`;
        },
      },
    });
  };
}

export function ValidateFormContentBasedOnFormId(
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'ValidateFormContentBasedOnFormId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const formId = (args.object as any).formId;
          switch (formId) {
            case 1:
              return validateSync(new FormContentDto1(value)).length === 0;
            case 2:
              return validateSync(new FormContentDto2(value)).length === 0;
            case 3:
              return validateSync(new FormContentDto3(value)).length === 0;
            case 4:
              return validateSync(new FormContentDto4(value)).length === 0;
            default:
              return true;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return (
            'Invalid form content for formId ' + (args.object as any).formId
          );
        },
      },
    });
  };
}
