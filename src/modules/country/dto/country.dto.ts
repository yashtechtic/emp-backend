import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Status } from '@app/common-config/dto/common.dto';

export class CountryDto {
  @IsNotEmpty({ message: 'Country name is required' })
  readonly country: string;

  @IsNotEmpty({ message: 'Country code is required' })
  @IsString({ message: 'Country code must be a string' })
  @Length(1, 3, { message: 'Country code must be between 1 and 3 characters' })
  readonly countryCode: string;

  @IsNotEmpty({ message: 'Country ISO code is required' })
  @Length(1, 3, {
    message: 'Country ISO code must be between 1 and 3 characters',
  })
  readonly countryCodeIso3: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  readonly description: string;

  @IsNotEmpty({ message: 'Dial code is required' })
  @IsString({ message: 'Dial code must be a string' })
  readonly dialCode: string;

  @IsNotEmpty({ message: 'Status is required' })
  readonly status: Status;
}

export class GetCountryListDto {
  @IsString()
  @IsOptional()
  keyword: string;
}
