import { IsNotEmpty, IsOptional } from 'class-validator';

export class SystemEmailDto {
  @IsNotEmpty({ message: 'Email code is required' })
  readonly emailCode: string;

  @IsNotEmpty({ message: 'Email title is required' })
  readonly emailTitle: string;

  @IsOptional({ message: 'From Name is required' })
  readonly fromName: string;

  @IsOptional({ message: 'From email is required' })
  readonly fromEmail: string;

  @IsOptional({ message: 'Reply to name is required' })
  readonly replyToName: string;

  @IsOptional({ message: 'Reply to email is required' })
  readonly replyToEmail: string;

  @IsNotEmpty({ message: 'Email subject is required' })
  readonly emailSubject: string;

  @IsNotEmpty({ message: 'Email message is required' })
  readonly emailMessage: string;

  @IsNotEmpty()
  readonly variables: string[];
}
