import { Status } from '@app/common-config/dto/common.dto';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  readonly firstName: string;

  @IsNotEmpty()
  readonly lastName: string;

  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly userName: string;

  @IsNotEmpty()
  readonly rollId: number;

  @IsNotEmpty()
  readonly phoneNumber: string;

  @IsOptional()
  readonly timeZone: number;

  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(Status)
  readonly status: Status;

  @IsNotEmpty({ message: 'CountryId is required' })
  readonly countryId: number;

  @IsNotEmpty({ message: 'StateId is required' })
  readonly stateId: number;

  @IsNotEmpty({ message: 'City is required' })
  readonly city: string;

  @IsOptional()
  readonly companyId: number;

  //   @IsNotEmpty()
  //   @MinLength(8)
  //   readonly password: string;

  // Add more fields as needed
}

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
  // @IsNotEmpty({ message: 'Role id is required' })
  // readonly roleId: number;

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
