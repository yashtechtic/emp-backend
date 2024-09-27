import { Status } from '@app/common-config/dto/common.dto';
import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';

export class RoleDto {
  @IsNotEmpty({ message: 'Role name is required' })
  readonly roleName: string;

  @IsNotEmpty({ message: 'Role code is required' })
  readonly roleCode: string;

  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(Status)
  readonly status: Status;
}

export class RoleCapabilityUpdateDto {
  @IsArray({ message: 'capabilities must be an array' })
  @IsNotEmpty({ message: 'capabilities is required' })
  readonly capabilities: string[];
}
