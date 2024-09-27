import { IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Status } from '@app/common-config/dto/common.dto';

export class AssessmentDto {
  @IsNotEmpty({ message: 'Assessment title is required' })
  readonly assessmentTitle: string;

  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(Status, { message: 'Invalid status' })
  readonly status: Status;

  @IsOptional()
  @IsArray({ message: 'Questions must be an array' })
  readonly questions: AssessmentQuestionDto[];

  @IsOptional()
  addedBy: number;

  @IsOptional()
  categoryId: number;
}

export class AssessmentQuestionDto {
  @IsNotEmpty({ message: 'Question is required' })
  readonly question: string;

  @IsNotEmpty({ message: 'Question type is required' })
  readonly questionType: string;

  @IsOptional()
  @IsNotEmpty({ message: 'correct answer is required' })
  readonly correctAnswer: string;

  @IsOptional()
  @IsArray({ message: 'Options must be an array' })
  readonly options: AssessmentQuestionOptionDto[];
}

export class AssessmentQuestionOptionDto {
  @IsNotEmpty({ message: 'Option is required' })
  readonly optionData: string;
}
