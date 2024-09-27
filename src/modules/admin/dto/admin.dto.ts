import { IsNotEmpty, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { Status } from '@app/common-config/dto/common.dto';
export class ProfileDto {
  @IsNotEmpty({ message: 'First Name is required' })
  readonly firstName: string;

  @IsNotEmpty({ message: 'Last Name is required' })
  readonly lastName: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @IsNotEmpty({ message: 'phone number is required' })
  readonly phoneNumber: string;
}

export class UserDto extends ProfileDto {
  @IsNotEmpty({ message: 'Role id is required' })
  readonly roleId: number;

  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(Status)
  readonly status: Status;

  @IsOptional()
  readonly timeZone: number;

  @IsNotEmpty({ message: 'CountryId is required' })
  readonly countryId: number;

  @IsNotEmpty({ message: 'StateId is required' })
  readonly stateId: number;

  @IsNotEmpty({ message: 'City is required' })
  readonly city: string;

  @IsOptional()
  readonly postalCode?: string;

  @IsOptional()
  readonly address?: string;

  @IsOptional()
  image?: string;
}

export class CheckAdminEmailDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @IsOptional()
  readonly id: number;
}

export class CustomerCommon {
  @IsNotEmpty({ message: 'First name is required' })
  readonly firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  readonly lastName: string;

  @IsOptional()
  readonly profileImage: string;

  @IsNotEmpty({ message: 'dial code is required' })
  readonly dialCode: string;

  @IsNotEmpty({ message: 'phone number is required' })
  readonly phoneNumber: string;

  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(Status)
  readonly status: Status;
}

export class CustomerDto extends CustomerCommon {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  readonly email: string;
}
