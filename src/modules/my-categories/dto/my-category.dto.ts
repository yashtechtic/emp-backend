import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  Matches,
} from 'class-validator';
import { Status } from '@app/common-config/dto/common.dto';

export class MyCategoryDto {
  @IsNotEmpty({ message: 'Category name is required' })
  @IsString({ message: 'Category name must be a string' })
  readonly categoryName: string;

  @IsNotEmpty({ message: 'Category Type is required' })
  @IsString({ message: 'Category Type must be a string' })
  @Matches(/^[A-Z_]+$/, {
    message:
      'Category Type must be in capital letters and underscores only, and must not contain spaces, numbers, or special characters',
  })
  readonly categoryType: string;

  @IsOptional()
  @IsInt({ message: 'Parent Category ID must be an integer' })
  @Min(1, { message: 'Parent Category ID must be a positive integer' })
  readonly parentCategoryId?: number;

  @IsOptional()
  @IsNotEmpty({ message: 'Status is required' })
  readonly status: Status;
}

export class AutocompleteDto {
  @IsOptional()
  readonly keyword: string;

  @IsNotEmpty({ message: 'categoryType is required' })
  readonly categoryType: Status;

  @IsOptional({ message: 'isSystem is required' })
  readonly isAll: string;
}
export class CategoryUpdateDto {
  @IsNotEmpty({ message: 'Ids are required' })
  readonly ids: number[];

  @IsNotEmpty({ message: 'Category id is required' })
  readonly categoryId: number;

  @IsNotEmpty({ message: 'Category type is required' })
  readonly categoryType: Status;
}
