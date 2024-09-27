// PhishingTemplate.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Status } from '@app/common-config/dto/common.dto';

export class PhishingTemplateDto {
  @IsNotEmpty({ message: 'Template Name is required' })
  @IsString({ message: 'Template Name must be a string' })
  readonly templateName: string;

  @IsNotEmpty({ message: 'Sender Email is required' })
  @IsString({ message: 'Sender Email must be a string' })
  readonly senderEmail: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Sender Name is required' })
  @IsString({ message: 'Sender Name must be a string' })
  readonly senderName: string;

  @IsString({ message: 'Reply To Name must be a string' })
  replyToName: string;

  @IsString({ message: 'Reply To Email must be a string' })
  readonly replyToEmail: string;

  @IsNotEmpty({ message: 'Subject is required' })
  @IsString({ message: 'Subject must be a string' })
  readonly subject: string;

  @IsOptional()
  @IsString({ message: 'File must be a string' })
  readonly file: string;

  @IsOptional()
  @IsString({ message: 'File Type must be a string' })
  readonly fileType: string;

  @IsOptional()
  fileContent: string;

  @IsNotEmpty({ message: 'Landing Page ID is required' })
  @IsNumber({}, { message: 'Landing Page ID must be a number' })
  readonly landingPageId: number;

  @IsNotEmpty({ message: 'Domain ID is required' })
  @IsNumber({}, { message: 'Domain ID must be a number' })
  readonly domainId: number;

  @IsNotEmpty({ message: 'Category ID is required' })
  @IsNumber({}, { message: 'Category ID must be a number' })
  readonly categoryId: number;

  @IsNumber({}, { message: 'Difficulty Rating must be a number' })
  readonly difficultyRating: number;

  @IsOptional()
  @IsEnum(Status, { message: 'Status must be a valid enum value' })
  readonly status: Status;

  @IsOptional()
  addedBy: number;

  @IsOptional()
  updatedBy: number;

  @IsOptional()
  isSystemDomain: number;

  @IsOptional()
  isSystemLandingPage: number;
}
