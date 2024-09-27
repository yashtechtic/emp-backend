// PhishingSimulation.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class BusinessDays {
  @IsString({ each: true, message: 'Each business day must be a string' })
  days: string[];
}

export class PhishingSimulationDto {
  @IsNotEmpty({ message: 'Program Name is required' })
  @IsString({ message: 'Program Name must be a string' })
  readonly programName: string;

  @IsNotEmpty({ message: 'Send To is required' })
  @IsString({ message: 'Send To must be a string' })
  readonly sendTo: string;

  @IsNotEmpty({ message: 'Select Type is required' })
  @IsString({ message: 'Select Type must be a string' })
  readonly selectType: string;

  @IsOptional()
  @IsArray({ message: 'Category must be an array' })
  readonly groupDeptIds: any[];

  @IsNotEmpty({ message: 'Frequency is required' })
  @IsString({ message: 'Frequency must be a string' })
  readonly frequency: string;

  @IsNotEmpty({ message: 'Start Date is required' })
  @IsDate({ message: 'Start Date must be a date' })
  readonly startDate: Date;

  @IsNotEmpty({ message: 'Start Time is required' })
  @IsString({ message: 'Start Time must be a string' })
  readonly startTime: string;

  @IsOptional()
  @IsNumber()
  readonly timeZoneId: number;

  @IsOptional()
  @IsNumber()
  readonly isSendEmail: number;

  @IsOptional()
  @IsNumber()
  readonly emailOver: number;

  @IsOptional()
  @IsString()
  readonly emailOverType: string;

  @IsOptional()
  @IsString()
  readonly dayStartTime: string;

  @IsOptional()
  @IsString()
  readonly dayEndTime: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessDays)
  readonly businessDays: BusinessDays;

  @IsNotEmpty({ message: 'Category ID is required' })
  @IsNumber({}, { message: 'Category ID must be a number' })
  readonly categoryId: number;

  @IsOptional()
  @IsNotEmpty({ message: 'Difficulty Rating is required' })
  @IsString({ message: 'Difficulty Rating must be a string' })
  readonly difficultyRating: string;

  @IsNotEmpty({ message: 'Phishing Template ID is required' })
  @IsNumber({}, { message: 'Phishing Template ID must be a number' })
  readonly phishingTemplateId: number;

  @IsNotEmpty({ message: 'Domain ID is required' })
  @IsNumber({}, { message: 'Domain ID must be a number' })
  readonly domainId: number;

  @IsNotEmpty({ message: 'Landing Page ID is required' })
  @IsNumber({}, { message: 'Landing Page ID must be a number' })
  readonly landingPageId: number;

  @IsOptional()
  @IsNumber()
  readonly isSendEmailReport: number;

  @IsOptional()
  @IsNumber()
  readonly isHideEmailReport: number;

  @IsOptional()
  @IsNumber()
  readonly trackPhishingReply: number;

  @IsOptional()
  addedBy: number;

  @IsOptional()
  updatedBy: number;
}
