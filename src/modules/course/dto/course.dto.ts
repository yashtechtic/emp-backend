import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { Status } from '@app/common-config/dto/common.dto';

export class CourseDto {
  @IsNotEmpty({ message: 'Course title is required' })
  @IsString({ message: 'Course title must be a string' })
  readonly courseTitle: string;

  @IsNotEmpty({ message: 'Course type is required' })
  @IsString({ message: 'Course type must be a string' })
  readonly courseType: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  readonly description: string;

  @IsNotEmpty({ message: 'Duration is required' })
  @IsInt({ message: 'Duration must be an integer' })
  @Min(1, { message: 'Duration must be at least 1' })
  readonly duration: number;

  @IsNotEmpty({ message: 'Display library flag is required' })
  @IsInt({ message: 'Display library flag must be an integer' })
  readonly isDisplayLibrary: number;

  @IsNotEmpty({ message: 'Image is required' })
  @IsString({ message: 'Image must be a string' })
  image: string;

  @IsNotEmpty({ message: 'Category is required' })
  @IsInt({ message: 'Category must be an integer' })
  readonly categoryId: number;

  @IsOptional()
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(Status, { message: 'Status must be a valid enum value' })
  readonly status: Status;

  @IsOptional()
  addedBy: number;
}
