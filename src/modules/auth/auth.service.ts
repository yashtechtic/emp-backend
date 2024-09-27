import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { InsertResult, Repository, UpdateResult } from 'typeorm';

import { CapabilityMaster } from '../admin-role/entities/admin-role-capability-master.entity';
import { Roles } from '../admin-role/entities/admin-role.entity';

import { Admin } from '../admin/entities/admin.entity';
import { LogHistory, UserType } from './entities/logHistory.entity';
import { AdminMenu } from './entities/adminMenu.entity';
import { AdminPasswords } from './entities/adminPasswords.entity';
import {
  IAdminData,
  IAdminDatabyId,
  IAdminGroupData,
  IAdminPasswordData,
  IAdminRecord,
  IAdminValidationData,
  ICapability,
} from '../../interfaces/auth.interface';
import { SettingsService } from '@app/services/services/settings.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Condition } from '@app/common-config/dto/common.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private settings: SettingsService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly log: LoggerService,

    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,

    @InjectRepository(CapabilityMaster)
    private capabilityMasterRepository: Repository<CapabilityMaster>,

    @InjectRepository(LogHistory)
    private logHistoryRepository: Repository<LogHistory>,
    @InjectRepository(AdminMenu)
    private adminMenuRepository: Repository<AdminMenu>,
    @InjectRepository(AdminPasswords)
    private adminPasswordsRepository: Repository<AdminPasswords> // @InjectRepository(UserProfile) // private userProfileRepository: Repository<UserProfile>
  ) {}

  checkAdminData(columnName: string, value: string): Promise<IAdminData> {
    return this.adminRepository
      .createQueryBuilder('ma')
      .select([
        'ma.adminId as adminId',
        'ma.firstName as firstName',
        'ma.lastName as lastName',
        'ma.email as email',
        'ma.password as password',
        'ma.phoneNumber as phoneNumber',
        'ma.otpCode as otpCode',
        'ma.isEmailVerified as emailVerified',
        'ma.status as status',
        'ma.roleId as roleId',
        'r.roleName as roleName',
        'r.roleCode as roleCode',
        'r.status as roleStatus',
        'r.roleCapabilities as roleCapabilities',
      ])
      .leftJoin(Roles, 'r', 'r.roleId = ma.roleId')
      .where(`ma.${columnName} = '${value}'`)
      .getRawOne();
  }

  insertLogHistory(
    userId: number,
    ip: string,
    userType: any
  ): Promise<InsertResult> {
    return this.logHistoryRepository
      .createQueryBuilder('r')
      .insert()
      .into(LogHistory)
      .values({
        userId,
        ip,
        userType,
      })
      .execute();
  }

  updateAdminLogout(logId: number, adminId: number): Promise<UpdateResult> {
    return this.logHistoryRepository
      .createQueryBuilder()
      .update(LogHistory)
      .set({
        logoutDate: new Date(),
      })
      .where('logId = :logId', { logId })
      .andWhere('userId = :adminId', { adminId })
      .andWhere('userType = :userType', { userType: UserType.ADMIN })
      .execute();
  }

  getAdminDetails(adminId: number): Promise<IAdminPasswordData> {
    const queryBuilder = this.adminRepository
      .createQueryBuilder('ma')
      .select(['ma.adminId as adminId', 'ma.password as password'])
      .where('ma.adminId = :adminId', { adminId: adminId });

    return queryBuilder.getRawOne();
  }

  getAdminPasswords(columnName, value, limit): Promise<any[]> {
    return this.adminPasswordsRepository
      .createQueryBuilder('map')
      .select([
        'map.passwordId as passwordId',
        'map.adminId as adminId',
        'map.password as password',
        'map.addedDate as addedDate',
        'map.status as status',
      ])
      .where(`map.${columnName} = ${value}`)
      .limit(limit)
      .getRawMany();
  }

  updateAdminPassword(data, columnName, value): Promise<UpdateResult> {
    return this.adminRepository
      .createQueryBuilder()
      .update(Admin)
      .set(data)
      .where(`${columnName} = ${value}`)
      .execute();
  }

  insertAdminPasswords(data): Promise<InsertResult> {
    return this.adminMenuRepository
      .createQueryBuilder()
      .insert()
      .into(AdminPasswords)
      .values(data)
      .execute();
  }

  updateOtpCode(data, value): Promise<UpdateResult> {
    return this.adminRepository
      .createQueryBuilder()
      .update(Admin)
      .set({
        otpCode: data,
        modifiedDate: new Date(),
      })
      .where({ adminId: value })
      .execute();
  }

  findAdminByEmail(email: string): Promise<IAdminValidationData> {
    const queryBuilder = this.adminRepository
      .createQueryBuilder('ma')
      .select([
        'ma.name as name',
        'ma.email as email',
        'ma.emailVerified as emailVerified',
        'ma.status as status',
      ])
      .where('ma.email = :email', { email: email });

    return queryBuilder.getRawOne();
  }

  getAdminGroupData(adminId: number): Promise<IAdminGroupData | undefined> {
    return this.adminRepository
      .createQueryBuilder('ma')
      .select([
        'r.roleCode as roleCode',
        'r.roleCapabilities as roleCapabilities',
      ])
      .leftJoin(Roles, 'r', 'r.roleId = ma.roleId')
      .where('ma.adminId = :adminId', { adminId: adminId })
      .getRawOne();
  }

  getCapabilities(): Promise<ICapability[]> {
    return this.capabilityMasterRepository
      .createQueryBuilder('mcm')
      .select(['mcm.capabilityCode as capability'])
      .where({ status: 'Active' })
      .getRawMany();
  }

  async getMenu(parentId: number): Promise<any[]> {
    let menu = await this.adminMenuRepository
      .createQueryBuilder('mam')
      .select([
        'mam.adminMenuId as adminMenuId',
        'mam.menuDisplay as title',
        'mam.icon as icon',
        'mam.open as openIn',
        'mam.url as routerLink',
        'mam.capabilityCode as permission',
        'mam.uniqueMenuCode as id',
      ])
      .where({ parentId, status: 'Active' })
      .getRawMany();

    if (parentId === 0) {
      menu = menu.map((item) => {
        return {
          adminMenuId: item.adminMenuId,
          title: item.title,
          icon: item.icon,
          permission: item.permission,
          id: item.id,
          collapsed: true,
          subMenu: [],
        };
      });
    } else {
      menu = menu.map((item) => {
        return {
          ...item,
          collapsed: true,
          isChildItem: true,
          subMenu: [],
        };
      });
    }
    return menu;
  }

  getAdminByEmailCode(adminInfo): Promise<IAdminRecord> {
    const queryBuilder = this.adminRepository
      .createQueryBuilder('ma')
      .select(['ma.adminId as adminId'])
      .where('ma.email = :email', { email: adminInfo.email })
      .andWhere('ma.verificationCode = :code', { code: adminInfo.code });
    return queryBuilder.getRawOne();
  }

  updateAdminEmailVerified(adminId: number): Promise<UpdateResult> {
    return this.adminRepository
      .createQueryBuilder()
      .update(Admin)
      .set({ isEmailVerified: Condition.Yes, otpCode: null })
      .where('adminId = :adminId', { adminId })
      .execute();
  }

  getAdminDataById(id: number): Promise<IAdminDatabyId> {
    return this.adminRepository
      .createQueryBuilder('ma')
      .select(['ma.adminId as adminId', 'ma.name as name', 'ma.email as email'])
      .where('ma.adminId = :id', { id })
      .getRawOne();
  }

  updateEmailVerifyCode(id: number, otpCode: number): Promise<UpdateResult> {
    return this.adminRepository
      .createQueryBuilder()
      .update(Admin)
      .set({ otpCode })
      .where('adminId = :id', { id })
      .execute();
  }
  //   checkAdminEmail(email: string, id?: number): Promise<IAdminRecord> {
  //     const adminEmail = this.adminRepository
  //       .createQueryBuilder('ma')
  //       .select(['ma.adminId as adminId'])
  //       .where({ email });

  //     if (id) {
  //       adminEmail.andWhere('ma.adminId !=  :id', { id });
  //     }
  //     return adminEmail.getRawOne();
  //   }
}
