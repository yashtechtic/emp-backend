import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export enum Status {
  Active = 'Active',
  Inactive = 'Inactive',
  Pending = 'Pending',
  Hold = 'Hold',
  Expired = 'Expired',
}

export enum SubscriptionType {
  Premium = 'Premium',
  Basic = 'Basic',
}

export enum Condition {
  Yes = 'Yes',
  No = 'No',
}

export class StoreIdDto {
  @IsNotEmpty({ message: 'Store id can not be empty' })
  readonly storeId: string;
}

export class Filters {
  @IsNotEmpty({ message: 'Key is required' })
  readonly key;

  @IsNotEmpty({ message: 'Value is required' })
  readonly value;
}

export class Sort {
  @IsNotEmpty({ message: 'Key is required' })
  readonly prop;

  @IsNotEmpty({ message: 'Value is required' })
  readonly dir;
}

export class ListDto {
  @IsOptional()
  @IsArray({ message: 'Filters must be an array' })
  @ValidateNested({ each: true })
  @Type(() => Filters)
  readonly filters: Filters[];

  @IsOptional()
  readonly keyword: string;

  @IsOptional()
  keywordColumns: string[];

  @IsOptional()
  readonly name: string;

  @IsOptional()
  readonly limit: number;

  @IsOptional()
  readonly page: number;

  @IsOptional()
  @IsArray({ message: 'Sort must be an array' })
  @ValidateNested({ each: true })
  @Type(() => Sort)
  readonly sort: Sort[];
}

export class AutocompleteDto {
  @IsOptional()
  readonly keyword: string;

  @IsOptional()
  readonly type: Status;

  @IsOptional()
  readonly isAll: string;
}

export class ChangeStatus {
  @IsNotEmpty({ message: 'Ids are required' })
  readonly ids: number[];

  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(Status)
  readonly status: Status;
}
