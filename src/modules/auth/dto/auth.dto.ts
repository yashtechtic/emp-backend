import { IsNotEmpty, IsEmail } from 'class-validator';

export class ValidateAdminDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  readonly email: string;
}

export class AdminLoginDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  readonly email: string;

  @IsNotEmpty({ message: 'Password is required' })
  readonly password: string;
}

export class resetPasswordDto {
  @IsNotEmpty({ message: 'Otp code is required' })
  readonly otpCode: string;

  @IsNotEmpty({ message: 'Password is required' })
  readonly password: string;

  @IsNotEmpty({ message: 'Token is required' })
  readonly token: string;
}

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Old password is required' })
  readonly oldPassword: string;

  @IsNotEmpty({ message: 'New password is required' })
  readonly newPassword: string;
}

export class VerifyAdminEmailDto {
  @IsNotEmpty({ message: 'Verification token is required' })
  readonly verifyToken: string;
}
