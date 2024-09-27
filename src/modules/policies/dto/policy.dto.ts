import { Status } from '@app/common-config/dto/common.dto';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';

export class PolicyDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  readonly title: string;

  @IsNotEmpty({ message: 'Document is required' })
  @IsString({ message: 'Document must be a string' })
  document: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  readonly description: string;

  @IsNotEmpty({ message: 'Start Date is required' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsInt({ message: 'Start Date must be an integer' })
  @Min(0, { message: 'Start Date must be a positive integer' })
  startDate: string;

  @IsNotEmpty({ message: 'End Date is required' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsInt({ message: 'End Date must be an integer' })
  @Min(0, { message: 'End Date must be a positive integer' })
  endDate: string;

  @IsOptional()
  @IsEnum(Status, { message: 'Status must be a valid enum value' })
  readonly status: Status;
}
