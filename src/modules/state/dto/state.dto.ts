import { Filters, Sort, Status } from '@app/common-config/dto/common.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class StateDto {
  @IsNotEmpty({ message: 'State name is required' })
  readonly state: string;

  @IsNotEmpty({ message: 'State code is required' })
  readonly stateCode: string;

  @IsNotEmpty({ message: 'CountryId is required' })
  readonly countryId: number;

  @IsNotEmpty({ message: 'Status is required' })
  readonly status: Status;
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

  @IsOptional()
  readonly countryId: number;
}

export class GetStateListDto {
  @IsNotEmpty({ message: 'Country ID is required' })
  countryId: number;

  @IsOptional()
  @IsString({ message: 'Keyword must be a string' })
  keyword?: string;
}

export class AutocompleteDto {
  @IsOptional()
  readonly keyword: string;

  @IsOptional()
  @IsEnum(Status)
  readonly type: Status;

  @IsOptional()
  readonly countryId: number;
}
