import { Status } from '@app/common-config/dto/common.dto';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class NotificationTemplateDto {
  @IsNotEmpty({ message: 'Template Name is required' })
  @IsString({ message: 'Template Name must be a string' })
  readonly templateName: string;

  @IsNotEmpty({ message: 'Subject is required' })
  @IsString({ message: 'Subject must be a string' })
  readonly subject: string;

  @IsNotEmpty({ message: 'Sender Email is required' })
  @IsEmail({}, { message: 'Sender Email must be a valid email address' })
  readonly senderEmail: string;

  @IsNotEmpty({ message: 'Sender Name is required' })
  @IsString({ message: 'Sender Name must be a string' })
  readonly senderName: string;

  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  readonly content: string;

  @IsOptional()
  readonly categoryId: number;

  @IsOptional()
  @IsEnum(Status, { message: 'Status must be a valid enum value' })
  readonly status: Status;
}
