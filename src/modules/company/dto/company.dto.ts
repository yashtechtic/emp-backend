import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
} from 'class-validator';
import { Status } from '@app/common-config/dto/common.dto';

export class CreateCompanyDto {
  @IsNotEmpty({ message: 'Company name is required' })
  readonly companyName: string;

  @IsEmail()
  readonly companyEmail: string;

  @IsNotEmpty({ message: 'Firstname is required' })
  readonly firstName: string;

  @IsNotEmpty({ message: 'lastname is required' })
  readonly lastName: string;

  @IsNotEmpty({ message: 'Dial code is required' })
  readonly dialCode: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  readonly phoneNumber: string;

  @IsNotEmpty({ message: 'Address is required' })
  readonly address?: string;

  @IsNotEmpty({ message: 'City is required' })
  readonly city: string;

  @IsNotEmpty({ message: 'StateId is required' })
  readonly stateId: number;

  @IsNotEmpty({ message: 'CountryId is required' })
  readonly countryId: number;

  @IsNotEmpty({ message: 'StateId is required' })
  readonly subscriptionId: number;

  @IsNotEmpty({ message: 'Number Of users is required' })
  readonly numberOfUsers: number;

  @IsNotEmpty({ message: 'Subscription start date is required' })
  readonly subscriptionStartDate: Date;

  @IsNotEmpty({ message: 'Subscription expiry date is required' })
  readonly subscriptionExpiryDate: Date;

  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(Status)
  status?: Status;
}
export class UpdateCompanyDto {
  @IsOptional()
  readonly companyName?: string;

  @IsOptional()
  @IsEmail()
  readonly companyEmail?: string;

  @IsOptional()
  readonly address?: string;

  @IsOptional()
  readonly city?: string;

  @IsOptional()
  readonly stateId?: number;

  @IsOptional()
  readonly countryId?: number;

  @IsOptional()
  logo: string;
}
