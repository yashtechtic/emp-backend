import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsUrl,
  IsNumber,
} from 'class-validator';
import { Status } from '@app/common-config/dto/common.dto';

export class DomainDto {
  @IsNotEmpty({ message: 'Domain url is required' })
  @IsString({ message: 'Domain url must be a string' })
  readonly domainUrl: string;

  @IsNotEmpty({ message: 'Root domain is required' })
  @IsNumber({}, { message: 'Root domain must be a number' })
  readonly rootDomainId: number;

  @IsOptional()
  @IsNotEmpty({ message: 'Domain type is required' })
  @IsString({ message: 'Domain type must be a string' })
  readonly domainType: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(Status, { message: 'Status must be a valid enum value' })
  readonly status: Status;
}
