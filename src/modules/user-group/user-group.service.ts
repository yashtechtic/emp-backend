import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  InsertResult,
  IsNull,
  Not,
  ObjectLiteral,
  Repository,
  UpdateResult,
} from 'typeorm';
import _ from 'underscore';
import { AutocompleteDto, Status } from '@app/common-config/dto/common.dto';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';
import {
  IGroupAutoComplete,
  IGroupDetail,
  IGroupList,
  IGroupRecord,
} from '../../interfaces/companies/group-user.interface';
import { ListUtility } from '@app/utilities/list.utility';
import { Group } from './entity/group.entity';
import { GroupUser } from './entity/user-group.entity';
import { User } from '../users/entities/user.entity';
import { GroupToRole } from './entity/group-role-association.entity';
import { Roles } from '../company-roles/entities/company-role.entity';
import { Interval } from '@nestjs/schedule';
import { FieldValue } from './../dynamic-forms/entities/field-value.entity';
import { DateService } from '@app/services/services/date.service';
import { subDays, subMonths, subWeeks } from 'date-fns';

@Injectable()
export class UserGroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(GroupUser)
    private groupUserRepository: Repository<GroupUser>,
    @InjectRepository(GroupToRole)
    private groupToRoleRepository: Repository<GroupToRole>,
    private listUtility: ListUtility,
    private dataSource: DataSource,
    @InjectRepository(FieldValue)
    private fieldValueRepository: Repository<FieldValue>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dateService: DateService
  ) {}

  getGroupColumnAliases = (): ObjectLiteral => {
    return {
      groupId: 'g.groupId',
      groupName: 'g.groupName',
      groupCode: 'g.groupCode',
      status: 'g.status',
    };
  };

  async findAllGroups(params): Promise<IGroupList> {
    let paging: ISettingsParams;
    let data: IGroupDetail[];
    const queryObj = this.groupRepository.createQueryBuilder('g');

    queryObj.where({ isDeleted: 0 });

    if (
      Object.keys(params).length > 0 &&
      (params.onlyNormalGroup !== undefined || params.onlyNormalGroup !== null)
    ) {
      queryObj.andWhere('g.isNormalGroup = :isNormalGroup', {
        isNormalGroup: params.onlyNormalGroup,
      });
    }

    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['g.groupName', 'g.groupCode'];
    }
    const aliasList = this.getGroupColumnAliases();
    this.listUtility.prepareListingCriteria(params, aliasList, queryObj);
    const totRecords = await queryObj.getCount();
    if (totRecords) {
      paging = this.listUtility.getPagination(totRecords, params);

      queryObj.offset(paging.offset);
      if (paging.per_page > 0) {
        queryObj.limit(paging.per_page);
      }

      data = await queryObj
        .select([
          'g.groupId as groupId',
          'g.groupName as groupName',
          'g.groupCode as groupCode',
          'g.isNormalGroup as isNormalGroup',
          'g.status as status',
        ])
        .execute();
    }

    const queryResult = {
      paging,
      data,
    };
    return queryResult;
  }

  groupDetail(groupId: number, otherCondition?: string): Promise<IGroupDetail> {
    const details = this.groupRepository
      .createQueryBuilder('g')
      .select([
        'g.groupId as groupId',
        'g.groupName as groupName',
        'g.groupCode as groupCode',
        'g.status as status',
        'g.formContent as formContent',
      ])
      .where(`g.groupId = :groupId`, { groupId });

    if (otherCondition) {
      details.andWhere(otherCondition);
    }
    return details.getRawOne();
  }

  groupUserDetail(
    groupId: number[],
    otherCondition?: string
  ): Promise<IGroupDetail[]> {
    let detailsQuery = this.groupUserRepository
      .createQueryBuilder('gu')
      .innerJoin(User, 'u', 'u.userId = gu.userId')
      .select([
        'gu.userId as userId',
        "CONCAT(u.firstName, ' ', u.lastName) AS userName",
        'gu.groupId as groupId',
      ])
      .where(`gu.groupId IN (:...groupId)`, { groupId });

    if (otherCondition) {
      detailsQuery = detailsQuery.andWhere(otherCondition);
    }
    return detailsQuery.execute(); // Execute the query and get the results
  }

  groupRoles(
    groupId: number[],
    otherCondition?: string
  ): Promise<IGroupDetail[]> {
    let detailsQuery = this.groupToRoleRepository
      .createQueryBuilder('gr')
      .innerJoin(Roles, 'r', 'r.roleId = gr.roleId')
      .select(['r.roleName as roleName', 'gr.roleId as roleId'])
      .where(`gr.groupId IN (:...groupId)`, { groupId });

    if (otherCondition) {
      detailsQuery = detailsQuery.andWhere(otherCondition);
    }

    return detailsQuery.execute(); // Execute the query and get the results
  }

  getGroupCodeForAdd(groupCode: string): Promise<IGroupRecord> {
    return this.groupRepository
      .createQueryBuilder('g')
      .select('g.groupId as groupId')
      .where({ groupCode: groupCode })
      .getRawOne();
  }

  async createGroup(groupdata: Group): Promise<InsertResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (groupdata.isNormalGroup && groupdata?.formContent) {
        delete groupdata.formContent;
      }

      const { roles, ...restGroupdata } = groupdata;

      const newGroup: any = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Group)
        .values(restGroupdata)
        .execute();

      const newGroupId = await newGroup.identifiers[0].groupId;

      if (newGroupId && roles.length) {
        const groupToRoleValues = [];
        for (const roleId of roles) {
          groupToRoleValues.push({ roleId, groupId: newGroupId });
        }

        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(GroupToRole)
          .values(groupToRoleValues)
          .execute();
      }

      await queryRunner.commitTransaction();

      if (newGroup?.raw?.affectedRows > 0) {
        if (!groupdata.isNormalGroup) {
          // formName: 'User Field'
          if (groupdata.formId === 1) {
            newGroup.users = [];

            const userFieldMembershipPolicy =
              await this.handleUserFieldMembershipPolicy(
                true,
                newGroup?.identifiers[0].groupId
              );

            if (userFieldMembershipPolicy.length) {
              const promises = userFieldMembershipPolicy.map(
                async (groupUser) => {
                  const users = await this.getUserDetails(groupUser);
                  newGroup.users.push(users);
                }
              );

              await Promise.all(promises).catch((error) => {
                console.error('An error occurred:', error);
              });
            }
          }
          // formName: 'User Date'
          if (groupdata.formId === 2) {
            newGroup.users = [];

            const userDateMembershipPolicy =
              await this.handleUserDateMembershipPolicy(
                true,
                newGroup?.identifiers[0].groupId
              );

            if (userDateMembershipPolicy.length) {
              const promises = userDateMembershipPolicy.map(
                async (groupUser) => {
                  const users = await this.getUserDetails(groupUser);
                  newGroup.users.push(users);
                }
              );

              await Promise.all(promises).catch((error) => {
                console.error('An error occurred:', error);
              });
            }
          }
          // formName: 'Phish Event/Campaign'
          if (groupdata.formId === 3) {
            // const userCampaignMembershipPolicy =
            //   await this.handlePhishingCampaignMembershipPolicy();
          }
          if (groupdata.formId === 4) {
            // const userCampaignMembershipPolicy =
            //   await this.handleTrainingMembershipPolicy();
          }
        }
      }

      return newGroup;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
        console.error(error); // Log the error object
        throw error;
      }
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  getGroupCodeForUpdate(groupCode: string, id: number): Promise<ObjectLiteral> {
    const queryBuilder = this.groupRepository
      .createQueryBuilder('g')
      .select(['g.groupId as groupId']);
    if (groupCode) {
      queryBuilder.andWhere('g.groupCode = :groupCode', { groupCode });
    }
    if (id) {
      queryBuilder.andWhere('g.groupId != :id', { id });
    }
    const data = queryBuilder.getRawOne();
    return data;
  }

  async updateGroup(groupData: Group, groupId: number): Promise<UpdateResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Exclude the groupUser property from the update operation
      const { roles, groupUser, ...updateData } = groupData;

      const updateGroup = await queryRunner.manager
        .createQueryBuilder()
        .update(Group)
        .set(updateData) // Use the updateData that excludes groupUser
        .where({ groupId, isNormalGroup: true }) // Add the condition for isNormalGroup
        .execute();

      if (
        updateGroup &&
        updateGroup.affected > 0 &&
        groupUser &&
        groupUser.length > 0
      ) {
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(GroupUser)
          .where('groupId = :groupId', { groupId: groupId })
          .execute();

        const groupUserData = [];
        groupData.groupUser.forEach((el) => {
          groupUserData.push({
            userId: el,
            groupId: groupId,
          });
        });
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(GroupUser)
          .values(groupUserData)
          .execute();
      }

      // if (roles && roles.length > 0) {
      //   await queryRunner.manager
      //     .createQueryBuilder()
      //     .delete()
      //     .from(GroupToRole)
      //     .where('groupId = :groupId', { groupId: groupId })
      //     .execute();

      //   const roleData = [];
      //   roles.forEach((el) => {
      //     roleData.push({
      //       roleId: el,
      //       groupId: groupId,
      //     });
      //   });
      //   await queryRunner.manager
      //     .createQueryBuilder()
      //     .insert()
      //     .into(GroupToRole)
      //     .values(roleData)
      //     .execute();
      // }

      await queryRunner.commitTransaction();
      return updateGroup;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
        console.error(error); // Log the error object
        throw error;
      }
    } finally {
      // Ensure you release the query runner in the finally block
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  async deleteGroup(id): Promise<UpdateResult> {
    /*need to do : If any group is associated with a role, the company admin can delete this group or not ? */
    await this.groupRepository.update({ groupId: id }, { isDeleted: 1 });
    return await this.groupRepository.update({ groupId: id }, { isDeleted: 1 });
  }

  groupAutocomplete(
    condition?: AutocompleteDto
  ): Promise<IGroupAutoComplete[]> {
    const queryBuilder = this.groupRepository
      .createQueryBuilder('g')
      .select(['g.groupId as groupId', 'g.groupName as groupName']);

    if (condition) {
      if (condition.keyword) {
        queryBuilder.andWhere('g.groupName LIKE :keyword', {
          keyword: `%${condition.keyword}%`,
        });
      }

      if (condition.type) {
        queryBuilder.andWhere('g.status = :status', {
          status: condition.type,
        });
      }
      return queryBuilder.getRawMany();
    }
  }

  groupChangeStatus(ids: number[], status: string): Promise<UpdateResult> {
    return this.groupRepository
      .createQueryBuilder()
      .update(Group)
      .set({ status: Status[status] })
      .where(`groupId IN (:...ids)`, { ids })
      .execute();
  }

  getGroupCode(groupName: string) {
    return groupName.replace(/\s+/g, '').toLowerCase().trim();
  }

  async handleUserFieldMembershipPolicy(
    wantResponse: boolean = false,
    currentGroupId = null
  ) {
    // Find all groups where isNormalGroup is false and formContent is not null
    const groups = await this.groupRepository.find({
      where: {
        status: Status.Active,
        isNormalGroup: false,
        formContent: Not(IsNull()),
        formId: 1,
      },
    });

    for (const group of groups) {
      const value = group?.formContent?.value;

      const fieldValue = await this.fieldValueRepository.findOne({
        where: {
          fieldId: group?.formContent?.user_profile_attribute?.fieldId,
          valueId: group?.formContent?.user_profile_attribute?.valueId,
        },
      });

      const fieldCondition = await this.fieldValueRepository.findOne({
        where: {
          fieldId: group?.formContent?.condition?.fieldId,
          valueId: group?.formContent?.condition?.valueId,
        },
      });

      const fieldComparison = await this.fieldValueRepository.findOne({
        where: {
          fieldId: group?.formContent?.comparison?.fieldId,
          valueId: group?.formContent?.comparison?.valueId,
        },
      });

      const condition = fieldCondition?.value;
      const comparison = fieldComparison?.value;

      if (fieldValue && fieldValue?.columnName && fieldValue?.tableName) {
        const columnName = fieldValue?.columnName;
        const tableName = fieldValue?.tableName;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          const queryBuilder = queryRunner.manager
            .createQueryBuilder()
            .select('tableAlias.userId')
            .from(tableName, 'tableAlias')
            .where(`tableAlias.${columnName} = :value`, { value });

          if (condition === 'Must') {
            queryBuilder.andWhere(`tableAlias.${columnName} IS NOT NULL`);
          } else if (condition === 'Must not') {
            queryBuilder.andWhere(`tableAlias.${columnName} != :value`, {
              value,
            });
          }

          if (comparison === 'Equal') {
            queryBuilder.andWhere(`tableAlias.${columnName} = :value`, {
              value,
            });
          } else if (comparison === 'Contains') {
            queryBuilder.andWhere(`tableAlias.${columnName} LIKE :value`, {
              value: `%${value}%`,
            });
          } else if (comparison === 'Starts With') {
            queryBuilder.andWhere(`tableAlias.${columnName} LIKE :value`, {
              value: `${value}%`,
            });
          } else if (comparison === 'Ends With') {
            queryBuilder.andWhere(`tableAlias.${columnName} LIKE :value`, {
              value: `%${value}`,
            });
          }

          const result = await queryBuilder.execute();
          const userIds = result?.map((row: any) => row.tableAlias_iUserId);

          // Fetch all users for the current group
          const groupUsers = await this.groupUserRepository.find({
            where: {
              groupId: group.groupId,
            },
          });

          // Remove users from the group that do not match the conditions
          const usersToRemove = groupUsers.filter(
            (groupUser) => !userIds.includes(groupUser.userId)
          );

          await this.groupUserRepository.remove(usersToRemove);

          // Add users to the group that match the conditions and are not already in the group
          const usersToAdd = userIds.filter(
            (userId: number) =>
              !groupUsers.some((groupUser) => groupUser.userId === userId)
          );
          const newGroupUsers = usersToAdd.map((userId: number) => ({
            groupId: group.groupId,
            userId: userId,
          }));

          await this.groupUserRepository.save(newGroupUsers);

          await queryRunner.commitTransaction();
        } catch (error) {
          if (queryRunner.isTransactionActive) {
            await queryRunner.rollbackTransaction();
            console.error(error); // Log the error object
            throw error;
          }
        } finally {
          if (!queryRunner.isReleased) {
            await queryRunner.release();
          }
        }
      }
    }

    if (wantResponse) {
      const groupUsers = await this.groupUserRepository.find({
        where: {
          groupId: currentGroupId,
        },
      });
      return groupUsers;
    }
  }

  async handleUserDateMembershipPolicy(
    wantResponse: boolean = false,
    currentGroupId = null
  ) {
    // Find all groups where isNormalGroup is false and formContent is not null
    const groups = await this.groupRepository.find({
      where: {
        status: Status.Active,
        isNormalGroup: false,
        formContent: Not(IsNull()),
        formId: 2,
      },
    });

    for (const group of groups) {
      // Timeframe : Range
      await this.handleRangeTimeframeGroup(group);

      // Timeframe : Any
      await this.handleAnyTimeframeGroup(group);

      // Timeframe : Duration
      await this.handleDurationTimeframeGroup(group);
    }

    if (wantResponse) {
      const groupUsers = await this.groupUserRepository.find({
        where: {
          groupId: currentGroupId,
        },
      });

      return groupUsers;
    }
  }

  async handlePhishingCampaignMembershipPolicy(
    wantResponse: boolean = false,
    currentGroupId = null
  ) {
    // Find all groups where isNormalGroup is false and formContent is not null
    const groups = await this.groupRepository.find({
      where: {
        status: Status.Active,
        isNormalGroup: false,
        formContent: Not(IsNull()),
        formId: 3,
      },
    });

    for (const group of groups) {
      // // Timeframe : Range
      // await this.handlePhishingCampaignRangeTimeframeGroup(group);
      // // Timeframe : Duration
      // await this.handlePhishingCampaignDurationTimeframeGroup(group);
      // Timeframe : Any
      // await this.handlePhishingCampaignAnyTimeframeGroup(group);
    }

    if (wantResponse) {
      const groupUsers = await this.groupUserRepository.find({
        where: {
          groupId: currentGroupId,
        },
      });

      return groupUsers;
    }
  }

  async handleTrainingMembershipPolicy(
    wantResponse: boolean = false,
    currentGroupId = null
  ) {
    // Find all groups where isNormalGroup is false and formContent is not null
    const groups = await this.groupRepository.find({
      where: {
        status: Status.Active,
        isNormalGroup: false,
        formContent: Not(IsNull()),
        formId: 3,
      },
    });

    for (const group of groups) {
      // // Timeframe : Range
      // await this.handlePhishingCampaignRangeTimeframeGroup(group);
      // // Timeframe : Duration
      // await this.handlePhishingCampaignDurationTimeframeGroup(group);
      // Timeframe : Any
      // await this.handlePhishingCampaignAnyTimeframeGroup(group);
    }

    if (wantResponse) {
      const groupUsers = await this.groupUserRepository.find({
        where: {
          groupId: currentGroupId,
        },
      });

      return groupUsers;
    }
  }

  async getUserDetails(groupUser) {
    const user = await this.userRepository
      .createQueryBuilder('us')
      .select([
        'us.userId as userId',
        'us.userName as userName',
        'us.addedDate as joinedOn',
      ])
      .where('us.userId = :userId', {
        userId: groupUser.userId,
      })
      .getRawOne();

    const group = await this.groupRepository
      .createQueryBuilder('g')
      .select('g.groupName as groupName')
      .where('g.groupId = :groupId', {
        groupId: groupUser.groupId,
      })
      .getRawOne();

    const result = {
      ...user,
      ...group,
    };
    return result;
  }

  async handleRangeTimeframeGroup(group) {
    if (group.formContent.timeFrame.value === 'Range') {
      const startDate = group.formContent.timeFrame.extraFields.startDate;
      const endDate = group.formContent.timeFrame.extraFields.endDate;

      const fieldCondition = await this.fieldValueRepository.findOne({
        where: {
          fieldId: group?.formContent?.condition?.fieldId,
          valueId: group?.formContent?.condition?.valueId,
        },
      });

      const fieldDateType = await this.fieldValueRepository.findOne({
        where: {
          fieldId: group?.formContent?.dateType?.fieldId,
          valueId: group?.formContent?.dateType?.valueId,
        },
      });

      const condition = fieldCondition?.value;
      const dateType = fieldDateType?.value;

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const queryBuilder = queryRunner.manager
          .createQueryBuilder()
          .select('tableAlias')
          .from('User', 'tableAlias');

        const results = await queryBuilder.getMany();

        if (results?.length) {
          if (condition === 'Must') {
            const dynamicQuery = (field) => {
              queryBuilder.andWhere(`tableAlias.${field} IS NOT NULL`);
              queryBuilder.andWhere(
                `tableAlias.${field} BETWEEN FROM_UNIXTIME(:startDate / 1000) AND FROM_UNIXTIME(:endDate / 1000)`,
                { startDate, endDate }
              );
            };

            if (dateType === 'Created') {
              dynamicQuery('addedDate');
            }
            if (dateType === 'Last Login') {
              dynamicQuery('lastLogin');
            }
            if (dateType === 'Employee Start Date') {
              dynamicQuery('employeeStartDate');
            }
            if (dateType === 'Last Password Change') {
              dynamicQuery('lastPasswordChange');
            }
          } else if (condition === 'Must not') {
            const dynamicQuery = (field) => {
              queryBuilder.andWhere(
                `tableAlias.${field} IS NULL OR (tableAlias.${field} NOT BETWEEN FROM_UNIXTIME(:startDate / 1000) AND FROM_UNIXTIME(:endDate / 1000))`,
                { startDate, endDate }
              );
            };
            if (dateType === 'Created') {
              dynamicQuery('addedDate');
            }
            if (dateType === 'Last Login') {
              dynamicQuery('lastLogin');
            }
            if (dateType === 'Employee Start Date') {
              dynamicQuery('employeeStartDate');
            }
            if (dateType === 'Last Password Change') {
              dynamicQuery('lastPasswordChange');
            }
          }

          const result = await queryBuilder.execute();

          const userIds = result?.map((row: any) => row.tableAlias_iUserId);

          // Fetch all users for the current group
          const groupUsers = await this.groupUserRepository.find({
            where: {
              groupId: group.groupId,
            },
          });

          // Remove users from the group that do not match the conditions
          const usersToRemove = groupUsers.filter(
            (groupUser) => !userIds.includes(groupUser.userId)
          );

          await this.groupUserRepository.remove(usersToRemove);

          // Add users to the group that match the conditions and are not already in the group
          const usersToAdd = userIds.filter(
            (userId: number) =>
              !groupUsers.some((groupUser) => groupUser.userId === userId)
          );
          const newGroupUsers = usersToAdd.map((userId: number) => ({
            groupId: group.groupId,
            userId: userId,
          }));

          await this.groupUserRepository.save(newGroupUsers);

          await queryRunner.commitTransaction();
        }
      } catch (error) {
        if (queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction();
          console.error(error); // Log the error object
          throw error;
        }
      } finally {
        if (!queryRunner.isReleased) {
          await queryRunner.release();
        }
      }
    }
  }

  async handleAnyTimeframeGroup(group) {
    if (group.formContent.timeFrame.value === 'Any') {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const queryBuilder = queryRunner.manager
          .createQueryBuilder()
          .select('tableAlias')
          .from('User', 'tableAlias');

        const results = await queryBuilder.getMany();

        if (results?.length) {
          const result = await queryBuilder.execute();

          const userIds = result?.map((row: any) => row.tableAlias_iUserId);

          if (userIds?.length) {
            // Fetch all users for the current group
            const groupUsers = await this.groupUserRepository.find({
              where: {
                groupId: group.groupId,
              },
            });

            // Remove users from the group that do not match the conditions
            const usersToRemove = groupUsers.filter(
              (groupUser) => !userIds.includes(groupUser.userId)
            );

            await this.groupUserRepository.remove(usersToRemove);

            // Add users to the group that match the conditions and are not already in the group
            const usersToAdd = userIds.filter(
              (userId: number) =>
                !groupUsers.some((groupUser) => groupUser.userId === userId)
            );
            const newGroupUsers = usersToAdd.map((userId: number) => ({
              groupId: group.groupId,
              userId: userId,
            }));

            await this.groupUserRepository.save(newGroupUsers);

            await queryRunner.commitTransaction();
          }
        }
      } catch (error) {
        if (queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction();
          console.error(error); // Log the error object
          throw error;
        }
      } finally {
        if (!queryRunner.isReleased) {
          await queryRunner.release();
        }
      }
    }
  }

  async handleDurationTimeframeGroup(group) {
    if (group.formContent.timeFrame.value === 'Duration') {
      const duration = group.formContent.timeFrame.extraFields.duration;
      const unitOfTime = group.formContent.timeFrame.extraFields.unitOfTime;
      const value = group.formContent.timeFrame.extraFields.value;

      const fieldDateType = await this.fieldValueRepository.findOne({
        where: {
          fieldId: group?.formContent?.dateType?.fieldId,
          valueId: group?.formContent?.dateType?.valueId,
        },
      });
      const dateType = fieldDateType?.value;

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        let startDate: Date;
        let endDate: Date;
        let result: any;

        if (duration === 'Prior to Last') {
          const now = new Date();

          switch (unitOfTime) {
            case 'Days':
              endDate = subDays(now, value);
              startDate = subDays(endDate, value);
              break;
            case 'Weeks':
              endDate = subWeeks(now, value);
              startDate = subWeeks(endDate, value);
              break;
            case 'Months':
              endDate = subMonths(now, value);
              startDate = subMonths(endDate, value);
              break;
          }

          const dynamicQuery = async (field: string) => {
            return await queryRunner.manager
              .createQueryBuilder()
              .select('tableAlias')
              .from('User', 'tableAlias')
              .where(`tableAlias.${field} BETWEEN :startDate AND :endDate`, {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
              })
              .getMany();
          };

          if (dateType === 'Created') {
            result = await dynamicQuery('addedDate');
          }
          if (dateType === 'Last Login') {
            result = await dynamicQuery('lastLogin');
          }
          if (dateType === 'Employee Start Date') {
            result = await dynamicQuery('employeeStartDate');
          }
          if (dateType === 'Last Password Change') {
            result = await dynamicQuery('lastPasswordChange');
          }
        } else if (duration === 'In the last') {
          const now = new Date();

          switch (unitOfTime) {
            case 'Days':
              endDate = now;
              startDate = subDays(now, value);
              break;
            case 'Weeks':
              endDate = now;
              startDate = subWeeks(now, value);
              break;
            case 'Months':
              endDate = now;
              startDate = subMonths(now, value);
              break;
          }

          const dynamicQuery = async (field: string) => {
            return await queryRunner.manager
              .createQueryBuilder()
              .select('tableAlias')
              .from('User', 'tableAlias')
              .where(`tableAlias.${field}  BETWEEN :startDate AND :endDate`, {
                startDate,
                endDate,
              })
              .getMany();
          };

          if (dateType === 'Created') {
            result = await dynamicQuery('addedDate');
          }
          if (dateType === 'Last Login') {
            result = await dynamicQuery('lastLogin');
          }
          if (dateType === 'Employee Start Date') {
            result = await dynamicQuery('employeeStartDate');
          }
          if (dateType === 'Last Password Change') {
            result = await dynamicQuery('lastPasswordChange');
          }
        }

        if (result?.length) {
          const userIds = result?.map((row: any) => row.userId);
          if (userIds?.length) {
            // Fetch all users for the current group
            const groupUsers = await this.groupUserRepository.find({
              where: {
                groupId: group.groupId,
              },
            });

            // Remove users from the group that do not match the conditions
            const usersToRemove = groupUsers.filter(
              (groupUser) => !userIds?.includes(groupUser.userId)
            );

            await this.groupUserRepository.remove(usersToRemove);

            // Add users to the group that match the conditions and are not already in the group
            const usersToAdd = userIds?.filter(
              (userId: number) =>
                !groupUsers.some((groupUser) => groupUser.userId === userId)
            );
            const newGroupUsers = usersToAdd.map((userId: number) => ({
              groupId: group.groupId,
              userId: userId,
            }));

            await this.groupUserRepository.save(newGroupUsers);
          }
        }

        await queryRunner.commitTransaction();
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
  }

  async handleMembershipCron() {
    // user membership policy
    await this.handleUserFieldMembershipPolicy();

    // user date policy
    await this.handleUserDateMembershipPolicy();

    // Phish Event/Campaign policy
    await this.handlePhishingCampaignMembershipPolicy();

    // Training policy
    await this.handleTrainingMembershipPolicy();
  }
}
