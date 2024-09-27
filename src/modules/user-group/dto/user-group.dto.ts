import {
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Status } from '@app/common-config/dto/common.dto';
import { Type } from 'class-transformer';
import { ValidateFormContentBasedOnFormId } from '@app/decorators/system.decorators';

class ExtraFieldsDto {
  startDate?: number;
  endDate?: number;
  duration?: string;
  unitOfTime?: string;
  value?: number;

  constructor(init?: Partial<ExtraFieldsDto>) {
    Object.assign(this, init);
  }
}
class FieldDto {
  @IsNotEmpty({ message: 'fieldId is required' })
  fieldId: number;

  @IsNotEmpty({ message: 'valueId is required' })
  valueId: number;

  value?: string;

  @ValidateNested()
  @Type(() => ExtraFieldsDto)
  extraFields?: ExtraFieldsDto;

  constructor(init?: Partial<FieldDto>) {
    Object.assign(this, init);
    if (init?.extraFields) {
      this.extraFields = new ExtraFieldsDto(init.extraFields);
    }
  }
}

export class FormContentDto1 {
  @ValidateNested()
  @Type(() => FieldDto)
  user_profile_attribute: FieldDto;

  @ValidateNested()
  @Type(() => FieldDto)
  condition: FieldDto;

  @ValidateNested()
  @Type(() => FieldDto)
  comparison: FieldDto;

  @IsNotEmpty({ message: 'value is required' })
  value: string;

  constructor(init?: Partial<FormContentDto1>) {
    Object.assign(this, init);
    this.user_profile_attribute = new FieldDto(init?.user_profile_attribute);
    this.condition = new FieldDto(init?.condition);
    this.comparison = new FieldDto(init?.comparison);
  }
}
export class FormContentDto2 {
  @IsDefined({ message: 'condition is required' })
  @ValidateNested()
  @Type(() => FieldDto)
  condition: FieldDto;

  @IsDefined({ message: 'dateType is required' })
  @ValidateNested()
  @Type(() => FieldDto)
  dateType: FieldDto;

  @IsDefined({ message: 'timeFrame is required' })
  @ValidateNested()
  @Type(() => FieldDto)
  timeFrame: FieldDto;

  constructor(init?: Partial<FormContentDto2>) {
    if (init?.condition) {
      this.condition = new FieldDto(init.condition);
    }
    if (init?.dateType) {
      this.dateType = new FieldDto(init.dateType);
    }
    if (init?.timeFrame) {
      this.timeFrame = new FieldDto(init.timeFrame);
    }
  }
}
export class FormContentDto3 {
  @IsDefined({ message: 'condition is required' })
  @ValidateNested()
  @Type(() => FieldDto)
  readonly condition: FieldDto;

  @IsDefined({ message: 'comparison is required' })
  @ValidateNested()
  @Type(() => FieldDto)
  readonly comparison: FieldDto;

  @IsDefined({ message: 'timeFrame is required' })
  @ValidateNested()
  @Type(() => FieldDto)
  readonly timeFrame: FieldDto;

  // @IsNotEmpty({ message: 'phish event is required' })
  readonly phishEvent: number;

  constructor(init?: Partial<FormContentDto3>) {
    if (init?.condition) {
      this.condition = new FieldDto(init.condition);
    }
    if (init?.comparison) {
      this.comparison = new FieldDto(init.comparison);
    }
    if (init?.timeFrame) {
      this.timeFrame = new FieldDto(init.timeFrame);
    }
  }
}

export class FormContentDto4 {
  readonly trainingEvent: number;
  readonly scope: number;
  readonly assignments: number;

  @IsDefined({ message: 'condition is required' })
  @ValidateNested()
  @Type(() => FieldDto)
  readonly condition: FieldDto;

  @IsDefined({ message: 'timeFrame is required' })
  @ValidateNested()
  @Type(() => FieldDto)
  readonly timeFrame: FieldDto;

  constructor(init?: Partial<FormContentDto4>) {
    if (init?.condition) {
      this.condition = new FieldDto(init.condition);
    }

    if (init?.timeFrame) {
      this.timeFrame = new FieldDto(init.timeFrame);
    }
  }
}

export class GroupDto {
  @IsNotEmpty({ message: 'Group name is required' })
  readonly groupName: string;

  // @IsNotEmpty()
  // groupCode: string;

  // @IsNotEmpty({ message: 'Status is required' })
  @IsOptional()
  @IsEnum(Status, { message: 'Invalid status' })
  readonly status: Status;

  @IsOptional()
  @IsArray({ message: 'Group users must be an array' })
  readonly groupUser: any[]; // Assuming array of users, adjust as necessary

  @IsOptional()
  @IsArray({ message: 'Role must be an array' })
  readonly roles: any[];

  @IsOptional()
  isNormalGroup: boolean;
  groupCode: string;

  @IsOptional()
  formId: number;

  @ValidateFormContentBasedOnFormId({ message: 'Form content is required.' })
  formContent: any;
}
export class UpdateGroupDto {
  @IsOptional()
  @IsEnum(Status, { message: 'Invalid status' })
  readonly status: Status;

  @IsOptional()
  groupCode: string;
  isNormalGroup: boolean;
  readonly groupName: string;
  readonly formId: number;

  @IsOptional()
  @IsArray({ message: 'Group users must be an array' })
  readonly groupUser: any[]; // Assuming array of users, adjust as necessary

  // @IsOptional()
  // @IsArray({ message: 'Role must be an array' })
  // readonly roles: any[];
}
