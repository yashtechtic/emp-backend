import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  DeleteResult,
  Repository,
  ObjectLiteral,
  UpdateResult,
  InsertResult,
} from 'typeorm';
import _ from 'underscore';

import { Status } from '@app/common-config/dto/common.dto';
import { Admin } from './entities/admin.entity';
import { CapabilityMaster } from '../admin-role/entities/admin-role-capability-master.entity';
import { Roles } from '../admin-role/entities/admin-role.entity';
import {
  IAdminAutocomplete,
  IAdminData,
  IAdminList,
  IAdminRecord,
  ICapability,
} from '../../interfaces/admin.interface';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';
import { ListUtility } from '@app/utilities/list.utility';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private listUtility: ListUtility,
    @InjectRepository(CapabilityMaster)
    private capabilityMasterRepository: Repository<CapabilityMaster>
  ) {}

  getUserColumnAlias(): ObjectLiteral {
    return {
      adminId: 'ma.adminId',
      firstName: 'ma.firstName',
      lastName: 'ma.lastName',
      email: 'ma.email',
      phoneNumber: 'ma.phoneNumber',
      lastAccess: 'ma.lastAccess',
      modifiedDate: 'ma.modifiedDate',
      roleId: 'ma.roleId',
      roleName: 'r.roleName',
      roleCode: 'r.roleCode',
      addedDate: 'ma.addedDate',
      status: 'ma.status',
    };
  }

  async findAllUsers(params, otherCondition?: string): Promise<IAdminList> {
    let paging: ISettingsParams;
    let data: IAdminData[];

    const queryObj = this.adminRepository
      .createQueryBuilder('ma')
      .leftJoin(Roles, 'r', 'r.roleId = ma.roleId');
    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['ma.name'];
    }
    const aliasList = this.getUserColumnAlias();
    this.listUtility.prepareListingCriteria(params, aliasList, queryObj);

    if (!!otherCondition) {
      queryObj.andWhere(otherCondition);
    }

    queryObj.andWhere({ isDeleted: 0 });

    const totRecords = await queryObj.getCount();
    if (totRecords) {
      paging = this.listUtility.getPagination(totRecords, params);
      queryObj.offset(paging.offset);
      if (paging.per_page > 0) {
        queryObj.limit(paging.per_page);
      }
      data = await queryObj
        .select([
          'ma.adminId as adminId',
          'ma.firstName as firstName',
          'ma.lastName as lastName',
          'ma.email as email',
          'ma.phoneNumber as phoneNumber',
          'ma.roleId as roleId',
          'ma.isEmailVerified as emailVerified',
          'getMilliseconds(ma.addedDate) as addedDate',
          'getMilliseconds(ma.modifiedDate) as modifiedDate',
          'getMilliseconds(ma.lastAccess) as lastAccess',
          'ma.status as status',
          'r.roleCode as roleCode',
          'r.roleName as roleName',
          'ma.image as imageUrl',
        ])
        .addSelect('ma.image', 'imageName')
        .execute();

      if (otherCondition) {
        queryObj.andWhere(otherCondition);
      }
    }

    const queryResult = {
      paging,
      data,
    };
    return queryResult;
  }

  findOneUser(
    value: number,
    columnName: string,
    otherCondition?: string
  ): Promise<IAdminData> {
    const user = this.adminRepository
      .createQueryBuilder('ma')
      .select([
        'ma.adminId as adminId',
        'ma.firstName as firstName',
        'ma.lastName as lastName',
        'ma.email as email',
        'ma.phoneNumber as phoneNumber',
        'ma.roleId as roleId',
        'r.roleName as roleName',
        'r.roleCode as roleCode',
        'ma.isEmailVerified as emailVerified',
        'ma.status as status',
        'ma.image as imageUrl',
        'ma.countryId as countryId',
        'ma.stateId as stateId',
        'ma.city as city',
        'ma.postalCode as postalCode',
        'ma.address as address',
      ])
      .addSelect('ma.image', 'imageName')
      .leftJoin(Roles, 'r', 'r.roleId = ma.roleId')
      .where(`ma.${columnName} = :value`, { value });

    if (otherCondition) {
      user.andWhere(otherCondition);
    }

    const data = user.getRawOne();
    return data;
  }

  checkAdminEmail(email: string, id?: number): Promise<IAdminRecord> {
    const adminEmail = this.adminRepository
      .createQueryBuilder('ma')
      .select(['ma.adminId as adminId'])
      .where({ email });

    if (id) {
      adminEmail.andWhere('ma.adminId !=  :id', { id });
    }
    return adminEmail.getRawOne();
  }

  createUser(userData: Admin): Promise<InsertResult> {
    const newUser = this.adminRepository
      .createQueryBuilder()
      .insert()
      .into(Admin)
      .values(userData)
      .execute();
    return newUser;
  }

  checkAdminExists(adminId: number): Promise<ObjectLiteral> {
    return this.adminRepository.findOne({
      select: {
        adminId: true,
        roleId: true,
      },
      where: {
        adminId: adminId,
      },
    });
  }

  updateAdmin(
    userData: Admin,
    columnName: string,
    value: number
  ): Promise<UpdateResult> {
    return this.adminRepository
      .createQueryBuilder()
      .update(Admin)
      .set(userData)
      .where(`${columnName} = :value`, { value })
      .execute();
  }

  deleteAdmin(id: number, condition: string): Promise<DeleteResult> {
    const queryBuilder = this.adminRepository
      .createQueryBuilder('mc')
      .update({ isDeleted: 1 });

    if (condition) {
      queryBuilder.andWhere(condition);
    }

    queryBuilder.where('adminId = :id', { id });

    return queryBuilder.execute();
  }

  getAdminAutocomplete(
    whereCond: string,
    keyword?: string
  ): Promise<IAdminAutocomplete[]> {
    let result = this.adminRepository
      .createQueryBuilder('ma')
      .select([
        'ma.adminId as adminId',
        "CONCAT(ma.firstName, ' ', ma.lastName) as name",
      ])
      .where(whereCond);

    if (keyword) {
      result = result.andWhere(
        `CONCAT(ma.firstName, ' ', ma.lastName) LIKE '%${keyword}%'`
      );
    }
    return result.getRawMany();
  }
  updateStatusUser(ids: number[], status: string): Promise<UpdateResult> {
    return this.adminRepository
      .createQueryBuilder()
      .update(Admin)
      .set({ status: () => `'${Status[status]}'` })
      .where(`adminId IN (${ids.join(',')})`)
      .execute();
  }

  adminIdentity(adminId: number, roleId?: number): Promise<IAdminData> {
    return this.adminRepository
      .createQueryBuilder('ma')
      .select([
        'ma.adminId as adminId',
        'ma.name as name',
        'ma.email as email',
        'ma.userName as userName',
        'ma.dialCode as dialCode',
        'ma.phoneNumber as phoneNumber',
        'ma.emailVerified as emailVerified',
        'ma.status as status',
        'r.roleName as roleName',
        'r.roleId as roleId',
        'r.roleCode as roleCode',
        'r.roleCapabilities as capabilities',
      ])
      .leftJoin(Roles, 'r', 'r.roleId = ma.roleId')
      .where({ adminId, roleId })
      .getRawOne();
  }

  getCapabilities(id?: number): Promise<ICapability[]> {
    const capabilities = this.capabilityMasterRepository
      .createQueryBuilder('mcm')
      .select([
        'mcm.capabilityId as capabilityId',
        'mcm.capabilityName as capabilityName',
        'mcm.capabilityCode as capabilityCode',
        'mcm.capabilityType as capabilityType',
        'mcm.capabilityMode as capabilityMode',
        'mcm.entityName as entityName',
        'mcm.parentEntity as parentEntity',
      ]);

    if (id) {
      capabilities.where({ categoryISd: id });
    }
    return capabilities.getRawMany();
  }
}
