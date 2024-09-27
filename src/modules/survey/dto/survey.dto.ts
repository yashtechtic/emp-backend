import { IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Status } from '@app/common-config/dto/common.dto';

export class SurveyDto {
  @IsNotEmpty({ message: 'Survey title is required' })
  readonly surveyTitle: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(Status, { message: 'Invalid status' })
  readonly status: Status;

  @IsOptional()
  @IsArray({ message: 'Questions must be an array' })
  readonly questions: SurveyQuestionDto[];

  @IsOptional()
  addedBy: number;
}

export class SurveyQuestionDto {
  @IsNotEmpty({ message: 'Question is required' })
  readonly question: string;

  @IsNotEmpty({ message: 'Question type is required' })
  readonly questionType: string;

  @IsOptional()
  @IsArray({ message: 'Options must be an array' })
  readonly options: SurveyQuestionOptionDto[];
}

export class SurveyQuestionOptionDto {
  @IsNotEmpty({ message: 'Option is required' })
  readonly optionData: string;
}
