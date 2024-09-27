import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { Status } from '@app/common-config/dto/common.dto';

export class LandingPageDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  readonly title: string;

  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  readonly content: string;

  @IsNotEmpty({ message: 'URL is required' })
  @IsString({ message: 'URL must be a string' })
  readonly url: string;

  @IsOptional()
  categoryId: number;

  @IsOptional()
  @IsEnum(Status, { message: 'Status must be a valid enum value' })
  readonly status: Status;
}
