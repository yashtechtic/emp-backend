import { Status } from '@app/common-config/dto/common.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class RoleDto {
  @IsNotEmpty({ message: 'Role name is required' })
  readonly roleName: string;

  @IsOptional()
  roleCode: string;

  @IsOptional({ message: 'Status is required' })
  @IsEnum(Status)
  readonly status: Status;

  @IsOptional()
  @IsArray({ message: 'Group must be an array' })
  readonly groups: any[];
}

class CapabilityDetailsDto {
  @IsNotEmpty({ message: 'CapabilityCategoryId is required' })
  readonly capabilityCategoryId: number;

  @IsOptional()
  @IsArray()
  readonly groupId?: number[];

  @IsOptional()
  @IsArray()
  readonly departmentId?: number[];

  @IsNotEmpty({ message: 'categoryCapability is required' })
  @IsString()
  readonly categoryCapability?: string;
}

export class RoleCapabilityDto {
  @IsNotEmpty({ message: 'RoleId is required' })
  readonly roleId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CapabilityDetailsDto)
  readonly capabilityDetails: CapabilityDetailsDto[];
}
