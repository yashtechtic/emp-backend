import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  InsertResult,
  Not,
  ObjectLiteral,
  Repository,
  UpdateResult,
} from 'typeorm';
import _ from 'underscore';
import { Status } from '@app/common-config/dto/common.dto';
import { Roles } from './entities/admin-role.entity';
import { CapabilityCategory } from './entities/admin-role-capability.entity';
import { CapabilityMaster } from './entities/admin-role-capability-master.entity';
import { ListUtility } from '@app/utilities/list.utility';
import {
  ICapability,
  ICategory,
  IRoleAutoComplete,
  IRoleData,
  IRoleDetail,
  IRoleList,
  IRoleRecord,
} from '../../interfaces/role.interface';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

@Injectable()
export class RoleMasterService {
  constructor(
    @InjectRepository(CapabilityMaster)
    private capabilityMasterRepository: Repository<CapabilityMaster>,
    @InjectRepository(Roles)
    private roleMasterRepository: Repository<Roles>,
    @InjectRepository(CapabilityCategory)
    private capabilityCategoryRepository: Repository<CapabilityCategory>,
    private listUtility: ListUtility
  ) {}

  getRoleColumnAlias(): ObjectLiteral {
    return {
      roleId: 'r.roleId',
      roleName: 'r.roleName',
      roleCode: 'r.roleCode',
      status: 'r.status',
    };
  }

  async findAllRoles(params, otherCondition?: string): Promise<IRoleList> {
    let paging: ISettingsParams;
    let data: IRoleDetail[];

    const queryObj = this.roleMasterRepository.createQueryBuilder('r');

    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['r.roleCode'];
    }
    const aliasList = this.getRoleColumnAlias();
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
          'r.roleId as roleId',
          'r.roleName as roleName',
          'r.roleCode as roleCode',
          'r.status as status',
        ])
        .execute();

      const queryResult = {
        paging,
        data,
      };
      return queryResult;
    }
  }

  async findOneRole(
    columnName: string,
    value: number,
    otherCondition?: string
  ): Promise<IRoleDetail> {
    const Role = this.roleMasterRepository
      .createQueryBuilder('r')
      .select([
        'r.roleId as roleId',
        'r.roleName as roleName',
        'r.roleCode as roleCode',
        'r.roleCapabilities as capabilities',
        'r.status as status',
      ])
      .where(`r.${columnName} = '${value}'`);

    if (otherCondition) {
      Role.andWhere(otherCondition);
    }

    const data = await Role.getRawOne();

    if (data) {
      return {
        ...data,
        capabilities: JSON.parse(data.capabilities) || [],
      };
    }
  }

  getRoleCodeForAdd(roleCode: string): Promise<IRoleRecord> {
    return this.roleMasterRepository
      .createQueryBuilder('r')
      .select('r.roleId as roleId')
      .where({ roleCode: roleCode })
      .getRawOne();
  }

  createRole(roleData: Roles): Promise<InsertResult> {
    const newRole = this.roleMasterRepository
      .createQueryBuilder()
      .insert()
      .into(Roles)
      .values(roleData)
      .execute();
    return newRole;
  }

  getRoleData(roleId: number): Promise<IRoleData> {
    return this.roleMasterRepository.findOne({
      select: {
        roleId: true,
        roleCode: true,
      },
      where: {
        roleId: roleId,
      },
    });
  }

  getRoleCodeForUpdate(
    roleCode: string,
    id: number
  ): Promise<ObjectLiteral | null> {
    return this.roleMasterRepository.findOne({
      select: {
        roleId: true,
      },
      where: {
        roleCode: roleCode,
        roleId: Not(id),
      },
    });
  }

  updateRole(
    roleData,
    columnName: string,
    value: number
  ): Promise<UpdateResult> {
    return this.roleMasterRepository
      .createQueryBuilder()
      .update(Roles)
      .set(roleData)
      .where(`${columnName} = :value`, { value })
      .execute();
  }

  deleteRole(roleId: number, condition: string): Promise<DeleteResult> {
    return this.roleMasterRepository
      .createQueryBuilder('r')
      .update({ isDeleted: 1 })
      .where(condition)
      .andWhere({ roleId })
      .execute();
  }

  getRoleAutocomplete(
    whereCond: string,
    keyword?: string
  ): Promise<IRoleAutoComplete[]> {
    let result = this.roleMasterRepository
      .createQueryBuilder('r')
      .select(['r.roleId as roleId', 'r.roleName as roleName'])
      .where(whereCond);

    if (keyword) {
      result = result.andWhere(`r.roleName LIKE '%${keyword}%'`);
    }

    return result.getRawMany();
  }

  updateStatusRole(ids: number[], status: string): Promise<UpdateResult> {
    return this.roleMasterRepository
      .createQueryBuilder()
      .update(Roles)
      .set({ status: () => `'${Status[status]}'` })
      .where(`roleId IN (${ids.join(',')})`)
      .execute();
  }

  async getCapabilityCategory(): Promise<ICategory[]> {
    let category = await this.capabilityCategoryRepository
      .createQueryBuilder('mcc')
      .select([
        'mcc.capabilityCategoryId as categoryId',
        'mcc.categoryName as categoryName',
        'mcc.categoryCode as categoryCode',
      ])
      .where({ status: 'Active' })
      .getRawMany();

    category = category.map((item) => {
      return { ...item, capabilities: [] };
    });

    return category;
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
      capabilities.where({ category_id: id });
    }
    return capabilities.getRawMany();
  }

  updateCapability(id: number, data: string): Promise<UpdateResult> {
    return this.roleMasterRepository
      .createQueryBuilder('r')
      .update(Roles)
      .set({ roleCapabilities: data })
      .where({ roleId: id })
      .execute();
  }
}
