import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';

import {
  IUserData,
  IUserDatabyId,
  IUserGroupData,
  IUserPasswordData,
  IUserRecord,
  IUserValidationData,
  ICapability,
} from '../../interfaces/companies/user-auth.interface';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Condition } from '@app/common-config/dto/common.dto';
import { User } from '../users/entities/user.entity';
import { RoleMenu } from '../company-roles/entities/company-role-menu.entity';
import { Roles } from '../company-roles/entities/company-role.entity';

@Injectable()
export class UserAuthService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly log: LoggerService,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(RoleMenu)
    private capabilityMasterRepository: Repository<RoleMenu>
    // @InjectRepository(UserProfile) // private userProfileRepository: Repository<UserProfile>
  ) {}

  checkUserData(columnName: string, value: string): Promise<IUserData> {
    return this.userRepository
      .createQueryBuilder('us')
      .select([
        'us.userId as userId',
        'us.firstName as firstName',
        'us.lastName as lastName',
        'us.email as email',
        'us.password as password',
        'us.phoneNumber as phoneNumber',
        'us.otpCode as otpCode',
        'us.isEmailVerified as emailVerified',
        'us.status as status',
        'us.roleId as roleId',
        'r.roleName as roleName',
        'r.roleCode as roleCode',
        'r.status as groupStatus',
        'us.companyId as companyId',
      ])
      .leftJoin(Roles, 'r', 'r.roleId = us.roleId')
      .where(`us.${columnName} = '${value}'`)
      .getRawOne();
  }

  getUserDetails(userId: number): Promise<IUserPasswordData> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('us')
      .select(['us.userId as userId', 'us.password as password'])
      .where('us.userId = :userId', { userId: userId });

    return queryBuilder.getRawOne();
  }

  updateUserPassword(data, columnName, value): Promise<UpdateResult> {
    return this.userRepository
      .createQueryBuilder()
      .update(User)
      .set(data)
      .where(`${columnName} = ${value}`)
      .execute();
  }

  updateOtpCode(data, value): Promise<UpdateResult> {
    return this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        otpCode: data,
        modifiedDate: new Date(),
      })
      .where({ userId: value })
      .execute();
  }

  findUserByEmail(email: string): Promise<IUserValidationData> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('us')
      .select([
        'us.name as name',
        'us.email as email',
        'us.emailVerified as emailVerified',
        'us.status as status',
      ])
      .where('us.email = :email', { email: email });

    return queryBuilder.getRawOne();
  }

  getUserGroupData(userId: number): Promise<IUserGroupData | undefined> {
    return this.userRepository
      .createQueryBuilder('us')
      .select([
        'r.roleCode as roleCode',
        'r.roleCapabilities as roleCapabilities',
      ])
      .leftJoin(Roles, 'r', 'r.roleId = us.roleId')
      .where('us.userId = :userId', { userId: userId })
      .getRawOne();
  }

  getCapabilities(): Promise<ICapability[]> {
    return this.capabilityMasterRepository
      .createQueryBuilder('mcm')
      .select(['mcm.capabilityCode as capability'])
      .where({ status: 'Active' })
      .getRawMany();
  }

  getUserByEmailCode(userInfo): Promise<IUserRecord> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('us')
      .select(['us.userId as userId'])
      .where('us.email = :email', { email: userInfo.email })
      .andWhere('us.verificationCode = :code', { code: userInfo.code });
    return queryBuilder.getRawOne();
  }

  updateUserEmailVerified(userId: number): Promise<UpdateResult> {
    return this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ isEmailVerified: Condition.Yes, otpCode: null })
      .where('userId = :userId', { userId })
      .execute();
  }

  getUserDataById(id: number): Promise<IUserDatabyId> {
    return this.userRepository
      .createQueryBuilder('us')
      .select(['us.userId as userId', 'us.name as name', 'us.email as email'])
      .where('us.userId = :id', { id })
      .getRawOne();
  }

  updateEmailVerifyCode(id: number, otpCode: number): Promise<UpdateResult> {
    return this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ otpCode })
      .where('userId = :id', { id })
      .execute();
  }
}
