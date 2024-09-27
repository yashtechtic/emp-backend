import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Status } from '@app/common-config/dto/common.dto';

export class CityDto {
  @IsNotEmpty({ message: 'City name is required' })
  readonly city: string;

  @IsNotEmpty({ message: 'City code is required' })
  readonly cityCode: string;

  @IsNotEmpty({ message: 'CountryId is required' })
  readonly countryId: number;

  @IsNotEmpty({ message: 'StateId is required' })
  readonly stateId: number;

  @IsNotEmpty({ message: 'Status is required' })
  readonly status: Status;

}
export class CityAutocompleteDto {
  @IsOptional()
  readonly keyword: string;

  @IsOptional()
  @IsEnum(Status)
  readonly type: Status;

  @IsOptional()
  readonly countryId: number;

  @IsOptional()
  readonly stateId: number;
}
