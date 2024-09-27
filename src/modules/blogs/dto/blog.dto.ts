import { IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { Status } from '@app/common-config/dto/common.dto';

export class BlogDto {
  @IsNotEmpty({ message: 'author is required' })
  readonly author: string;

  @IsNotEmpty({ message: 'content is required' })
  readonly content: string;

  @IsNotEmpty({ message: 'title is required' })
  title: string;

  @IsNotEmpty({ message: 'image is required' })
  image: string;

  @IsOptional({ message: 'Status is required' })
  @IsEnum(Status, { message: 'Invalid status' })
  readonly status: Status;

  @IsNotEmpty({ message: 'estimatedReadingTime is required' })
  estimatedReadingTime: number;

  @IsNotEmpty({ message: 'Category is required' })
  @IsInt({ message: 'Category must be an integer' })
  readonly categoryId: number;
}
