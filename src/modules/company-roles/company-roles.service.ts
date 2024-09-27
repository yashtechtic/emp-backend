/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  DeleteResult,
  EntityManager,
  InsertResult,
  Not,
  ObjectLiteral,
  Repository,
  UpdateResult,
} from 'typeorm';
import _ from 'underscore';
import { Status } from '@app/common-config/dto/common.dto';
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
import { RoleMenu } from './entities/company-role-menu.entity';
import { Roles } from './entities/company-role.entity';
import { RoleUser } from './entities/role-users.entity';
import { GroupToRole } from '../user-group/entity/group-role-association.entity';
import { RoleCategory } from './entities/company-role-category.entity';
import { CapabilityGroupsDepartments } from './entities/capability-groups-dept.entity';
import {
  rolesCategoryList,
  rolesMenuList,
} from '../company/static-data/RolesAndRights';
import { UserGroupService } from '../user-group/user-group.service';
import { Group } from '../user-group/entity/group.entity';
import { RoleCapabilityDto } from './dto/company-role.dto';

@Injectable()
export class CompanyRolesService {
  constructor(
    @InjectRepository(RoleMenu)
    private capabilityMasterRepository: Repository<RoleMenu>,
    @InjectRepository(Roles)
    private roleMasterRepository: Repository<Roles>,
    @InjectRepository(RoleCategory)
    private capabilityCategoryRepository: Repository<RoleCategory>,
    @InjectRepository(CapabilityGroupsDepartments)
    private capabilityGroupsDepartmentsRepository: Repository<CapabilityGroupsDepartments>,
    private groupService: UserGroupService,
    private listUtility: ListUtility,
    private dataSource: DataSource
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
        .select(['r.roleId as roleId', 'r.roleName as roleName'])
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
      .createQueryBuilder('mgm')
      .select([
        'mgm.roleId as roleId',
        'mgm.roleName as roleName',
        'mgm.roleCode as roleCode',
        'mgm.roleCapabilities as capabilities',
        'mgm.status as status',
      ])
      .where(`mgm.${columnName} = '${value}'`);

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
      .createQueryBuilder('mgm')
      .select('mgm.roleId as roleId')
      .where({ roleCode: roleCode })
      .getRawOne();
  }

  async createRole(roleData: Roles): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const roleDetails: any = {};

    try {
      const newRole = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Roles)
        .values(roleData)
        .execute();

      let newRoleMenuIds = [];
      let roleId: number;

      const groupDetails = await queryRunner.manager
        .createQueryBuilder(Group, 'group')
        .select(['group.groupId', 'group.groupName'])
        .where('group.isDeleted = :isDeleted', { isDeleted: 0 })
        .andWhere('group.isNormalGroup = :onlyNormalGroup', {
          onlyNormalGroup: true,
        })
        .getMany();

      if (newRole.identifiers[0].roleId) {
        roleId = newRole.identifiers[0].roleId;
        roleDetails.roleId = roleId;

        for (const role of rolesMenuList) {
          const payload = {
            roleId,
            orderNumber: role.orderNumber,
            menuCode: role.menuValue,
            menuName: role.menuName,
          };

          const roleMenuId = await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(RoleMenu)
            .values(payload)
            .execute();
          newRoleMenuIds.push(roleMenuId.identifiers[0].roleMenuId);
        }
      }

      if (newRoleMenuIds && newRoleMenuIds?.length) {
        for (const roleMenuId of newRoleMenuIds) {
          const insertedRoleMenu = await queryRunner.manager
            .createQueryBuilder(RoleMenu, 'roleMenu')
            .where('roleMenu.roleMenuId = :roleMenuId', { roleMenuId })
            .getOne();

          for (const roleCategory of rolesCategoryList) {
            if (roleCategory.menuValue === insertedRoleMenu.menuCode) {
              const categories = roleCategory.categories;
              for (const category of categories) {
                const payload = {
                  roleMenuId,
                  orderNumber: category.orderNumber,
                  categoryName: category.categoryName,
                  categoryCode: category.categoryValue,
                  categoryCapability: category.currentValue,
                  possibleCapability: JSON.stringify(
                    category.possibleCapability
                  ),
                };

                const roleCategory = await queryRunner.manager
                  .createQueryBuilder()
                  .insert()
                  .into(RoleCategory)
                  .values(payload)
                  .execute();

                if (category.isGroupOrDeptAvailable) {
                  const roleCategoryId =
                    roleCategory.identifiers[0].capabilityCategoryId;
                  const payload = {
                    roleId,
                    roleCategoryId,
                  };
                  await queryRunner.manager
                    .createQueryBuilder()
                    .insert()
                    .into(CapabilityGroupsDepartments)
                    .values(payload)
                    .execute();
                }
              }
            }
          }
        }
      }

      if (roleData.groups && roleData.groups.length > 0) {
        const groupClone = [];
        roleData.groups.forEach((el) => {
          groupClone.push({
            groupId: el,
            roleId: newRole.identifiers[0].roleId,
          });
        });
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(GroupToRole)
          .values(groupClone)
          .execute();
      }

      if (roleId) {
        const roleMenus = await queryRunner.manager
          .createQueryBuilder(RoleMenu, 'roleMenu')
          .select([
            'roleMenu.orderNumber',
            'roleMenu.roleMenuId',
            'roleMenu.menuCode',
            'roleMenu.menuName',
            'roleCategory.orderNumber',
            'roleCategory.capabilityCategoryId',
            'roleCategory.categoryName',
            'roleCategory.categoryCode',
            'roleCategory.categoryCapability',
            'roleCategory.possibleCapability',
            'capabilityGroupsDepartments.capabilityGroupDepartmentId',
            'capabilityGroupsDepartments.groupId',
            'capabilityGroupsDepartments.departmentId',
          ])
          .leftJoin('roleMenu.roleCategories', 'roleCategory')
          .leftJoin('roleCategory.groupDept', 'capabilityGroupsDepartments')
          .where('roleMenu.roleId = :roleId', { roleId })
          .getRawAndEntities();

        // Use the transformed response directly
        roleDetails.roleMenus = this.transformResponse(roleMenus, groupDetails);
      }

      await queryRunner.commitTransaction();
      return roleDetails;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
        throw error;
      }
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  transformResponse = (response: any, groupDetails: any) => {
    const { raw } = response;

    // Map raw results to entities
    const roleMenusMap = new Map<number, any>();

    raw.forEach((row: any) => {
      if (!roleMenusMap.has(row.roleMenu_iRoleMenuId)) {
        roleMenusMap.set(row.roleMenu_iRoleMenuId, {
          orderNumber: row.roleMenu_iOrderNumber,
          roleMenuId: row.roleMenu_iRoleMenuId,
          menuCode: row.roleMenu_vMenuCode,
          menuName: row.roleMenu_vMenuName,
          roleCategories: [],
        });
      }

      const roleMenu = roleMenusMap.get(row.roleMenu_iRoleMenuId);

      // Check if the category already exists
      let category = roleMenu.roleCategories.find(
        (cat: any) =>
          cat.capabilityCategoryId === row.roleCategory_iRoleCategoryId
      );

      // If not, add the category
      if (!category) {
        category = {
          orderNumber: row.roleCategory_iOrderNumber,
          capabilityCategoryId: row.roleCategory_iRoleCategoryId,
          categoryName: row.roleCategory_vCategoryName,
          categoryCode: row.roleCategory_vCategoryCode,
          categoryCapability: row.roleCategory_vCategoryCapability,
          possibleCapability: JSON.parse(row.roleCategory_vPossibleCapability),
          capabilityGroupsDepartments: [],
          isThereAnyGroupOrDept: false, // Initialize the flag
        };
        roleMenu.roleCategories.push(category);
      }

      // Add the capabilityGroupsDepartments details to the category
      const groupId = row.capabilityGroupsDepartments_iGroupId;
      const departmentId = row.capabilityGroupsDepartments_iDepartmentId;

      if (row.capabilityGroupsDepartments_iCapabilityGroupDepartmentId) {
        category.capabilityGroupsDepartments.push({
          capabilityGroupDepartmentId:
            row.capabilityGroupsDepartments_iCapabilityGroupDepartmentId,
          groupId: groupId,
          departmentId: departmentId,
          groups: groupDetails,
        });

        // Set the flag to true if either groupId or departmentId exists
        if (groupId !== null || departmentId !== null) {
          category.isThereAnyGroupOrDept = true;
        }
      }
    });

    // Convert map to array and return only the roleMenus array
    return Array.from(roleMenusMap.values());
  };

  getRoleData(roleId: number): Promise<IRoleData> {
    return this.roleMasterRepository.findOne({
      select: {
        roleId: true,
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

  async deleteRole(roleId: number, conditions: string): Promise<DeleteResult> {
    return await this.roleMasterRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        // Delete from roleCapabilityGroup where roleId matches
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(CapabilityGroupsDepartments)
          .where('roleId = :roleId', { roleId })
          .execute();

        // Delete from roleToGroup where roleId matches
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(GroupToRole)
          .where('roleId = :roleId', { roleId })
          .execute();

        // Delete from roleUser where roleId matches
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(RoleUser)
          .where('roleId = :roleId', { roleId })
          .execute();

        // Delete from roleCapability where roleId matches
        // await transactionalEntityManager
        //   .createQueryBuilder()
        //   .delete()
        //   .from(RoleCapabilities)
        //   .where('roleId = :roleId', { roleId })
        //   .execute();

        // Finally, delete from role where roleId matches
        const deleteRole = await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(Roles)
          .where('roleId = :roleId', { roleId })
          .execute();
        return deleteRole;
      }
    );
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
        'mcm.capabilityCode as capabilityCode',
        'mcm.capabilityName as capabilityName',
        'mcm.entityName as entityName',
      ]);

    if (id) {
      capabilities.where({ categoryId: id });
    }
    return capabilities.getRawMany();
  }

  getCategoryById(capabilityCategoryId: number): Promise<any> {
    return this.capabilityCategoryRepository
      .createQueryBuilder('roleCategory')
      .select(['roleCategory.capabilityCategoryId'])
      .where('roleCategory.capabilityCategoryId = :capabilityCategoryId', {
        capabilityCategoryId,
      })
      .getOne();
  }

  async updateRoleCapability(
    roleCapabilityDetails: RoleCapabilityDto
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { roleId, capabilityDetails } = roleCapabilityDetails;

      for (const capabilityDetail of capabilityDetails) {
        const {
          capabilityCategoryId,
          groupId,
          departmentId,
          categoryCapability,
        } = capabilityDetail;

        if (groupId?.length || departmentId?.length) {
          if (groupId?.length) {
            await this.updateCapabilityGroups(
              capabilityCategoryId,
              roleId,
              groupId
            );
          }

          if (departmentId?.length) {
            await this.updateCapabilityDepartment(
              capabilityCategoryId,
              roleId,
              departmentId
            );
          }
        }

        await queryRunner.manager
          .createQueryBuilder()
          .update(RoleCategory)
          .set({ categoryCapability })
          .where('capabilityCategoryId = :capabilityCategoryId', {
            capabilityCategoryId,
          })
          .execute();
      }

      await queryRunner.commitTransaction();

      // Return a success message or any result you need
      return {
        success: true,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateCapabilityGroups(
    capabilityCategoryId: number,
    roleId: number,
    groupIds: number[]
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete existing records matching the capabilityCategoryId and roleId
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(CapabilityGroupsDepartments)
        .where('roleCategoryId = :capabilityCategoryId', {
          capabilityCategoryId,
        })
        .andWhere('roleId = :roleId', { roleId })
        .andWhere('(departmentId IS NULL OR departmentId = 0)')
        .execute();

      // Insert new groups
      const newEntries = groupIds.map((groupId) => ({
        roleCategoryId: capabilityCategoryId,
        roleId,
        groupId,
      }));

      if (newEntries.length > 0) {
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(CapabilityGroupsDepartments)
          .values(newEntries)
          .execute();
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateCapabilityDepartment(
    capabilityCategoryId: number,
    roleId: number,
    departmentIds: number[]
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete existing records matching the capabilityCategoryId and roleId
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(CapabilityGroupsDepartments)
        .where('roleCategoryId = :capabilityCategoryId', {
          capabilityCategoryId,
        })
        .andWhere('roleId = :roleId', { roleId })
        .andWhere('(groupId IS NULL OR groupId = 0)')
        .execute();

      // Insert new groups
      const newEntries = departmentIds.map((departmentId) => ({
        roleCategoryId: capabilityCategoryId,
        roleId,
        departmentId,
      }));

      if (newEntries.length > 0) {
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(CapabilityGroupsDepartments)
          .values(newEntries)
          .execute();
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
