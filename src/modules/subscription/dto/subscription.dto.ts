import { Status } from '@app/common-config/dto/common.dto';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsEnum,
} from 'class-validator';

export class SubscriptionDto {
  @IsNotEmpty({ message: 'Subscription name is required' })
  @IsString({ message: 'Subscription name must be a string' })
  readonly planName: string;

  // @IsNotEmpty({ message: 'Subscription code is required' })
  // @IsString({ message: 'Subscription code must be a string' })
  // @Length(3, 10, {
  //   message: 'Subscription code must be between 3 and 10 characters',
  // })
  planCode: string;

  @IsNotEmpty({ message: 'Price is required' })
  readonly price: number;

  @IsNotEmpty({ message: 'Rates is required' })
  readonly rates: string;

  @IsNotEmpty({ message: 'Overview is required' })
  readonly overview: string;

  @IsNotEmpty({ message: 'Feature Details is required' })
  readonly featureDetails: string;

  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(Status, {
    message: 'Status must be either ACTIVE or INACTIVE',
  })
  readonly status: Status;
  readonly isDeleted: boolean;
}
