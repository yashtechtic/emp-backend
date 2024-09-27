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

import { ISettingsParams } from '@app/common-config/interfaces/common-interface';
import { ListUtility } from '@app/utilities/list.utility';
import { User } from './entities/user.entity';
import { RoleMenu } from '../company-roles/entities/company-role-menu.entity';
import {
  ICapability,
  IUserAutocomplete,
  IUserData,
  IUserList,
  IUserRecord,
} from '@app/interfaces/companies/user.interface';
import { Roles } from '../company-roles/entities/company-role.entity';
import { Country } from '../country/entities/country.entity';
import { State } from '../state/entities/state.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private listUtility: ListUtility,
    @InjectRepository(RoleMenu)
    private capabilityMasterRepository: Repository<RoleMenu>
  ) {}

  getUserColumnAlias(): ObjectLiteral {
    return {
      userId: 'us.userId',
      firstName: 'us.firstName',
      lastName: 'us.lastName',
      email: 'us.email',
      phoneNumber: 'us.phoneNumber',
      modifiedDate: 'us.modifiedDate',
      roleId: 'us.roleId',
      roleName: 'r.roleName',
      roleCode: 'r.roleCode',
      addedDate: 'us.addedDate',
      status: 'us.status',
    };
  }

  async findAllUsers(params, otherCondition?: string): Promise<IUserList> {
    let paging: ISettingsParams;
    let data: IUserData[];

    const queryObj = this.userRepository
      .createQueryBuilder('us')
      .leftJoin(Roles, 'r', 'r.roleId = us.roleId');
    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['us.name'];
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
          'us.userId as userId',
          'us.firstName as firstName',
          'us.lastName as lastName',
          'us.email as email',
          'us.phoneNumber as phoneNumber',
          'us.roleId as roleId',
          'us.isEmailVerified as emailVerified',
          '(UNIX_TIMESTAMP(us.addedDate) * 1000)  as addedDate',
          '(UNIX_TIMESTAMP(us.modifiedDate) * 1000) as modifiedDate',
          'us.status as status',
          'r.roleCode as roleCode',
          'r.roleName as roleName',
        ])
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
  ): Promise<IUserData> {
    const user = this.userRepository
      .createQueryBuilder('us')
      .select([
        'us.userId as userId',
        'us.firstName as firstName',
        'us.lastName as lastName',
        'us.email as email',
        'us.phoneNumber as phoneNumber',
        'us.address as address',
        'us.city as city',
        's.state as state',
        's.stateId as stateId',
        'c.country as country',
        'c.countryId as countryId',
        'us.roleId as roleId',
        'r.roleName as roleName',
        'r.roleCode as roleCode',
        'us.image as imageUrl',
        'us.status as status',
        'us.isEmailVerified as emailVerified',
      ])
      .addSelect('us.image as image')
      .leftJoin(Roles, 'r', 'r.roleId = us.roleId')
      .leftJoin(Country, 'c', 'c.countryId = us.countryId')
      .leftJoin(State, 's', 's.stateId = us.stateId')
      .where(`us.${columnName} = :value`, { value });

    if (otherCondition) {
      user.andWhere(otherCondition);
    }

    const data = user.getRawOne();
    return data;
  }

  checkUserEmail(email: string, id?: number): Promise<IUserRecord> {
    const userEmail = this.userRepository
      .createQueryBuilder('us')
      .select(['us.userId as userId'])
      .where({ email });

    if (id) {
      userEmail.andWhere('us.userId !=  :id', { id });
    }
    return userEmail.getRawOne();
  }

  createUser(userData: User): Promise<InsertResult> {
    const newUser = this.userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(userData)
      .execute();
    return newUser;
  }

  checkUserExists(userId: number): Promise<ObjectLiteral> {
    return this.userRepository.findOne({
      select: {
        userId: true,
        roleId: true,
      },
      where: {
        userId: userId,
      },
    });
  }

  updateUser(
    userData: User,
    columnName: string,
    value: number
  ): Promise<UpdateResult> {
    return this.userRepository
      .createQueryBuilder()
      .update(User)
      .set(userData)
      .where(`${columnName} = :value`, { value })
      .execute();
  }

  deleteUser(id: number, condition: string): Promise<DeleteResult> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('mc')
      .update({ isDeleted: 1 });

    if (condition) {
      queryBuilder.andWhere(condition);
    }

    queryBuilder.where('userId = :id', { id });

    return queryBuilder.execute();
  }

  getUserAutocomplete(
    whereCond: string,
    keyword?: string
  ): Promise<IUserAutocomplete[]> {
    let result = this.userRepository
      .createQueryBuilder('us')
      .select([
        'us.userId as userId',
        "CONCAT(us.firstName, ' ', us.lastName) as name",
      ])
      .where(whereCond);

    if (keyword) {
      result = result.andWhere(
        `CONCAT(us.firstName, ' ', us.lastName) LIKE '%${keyword}%'`
      );
    }
    return result.getRawMany();
  }
  updateStatusUser(ids: number[], status: string): Promise<UpdateResult> {
    return this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ status: () => `'${Status[status]}'` })
      .where(`userId IN (${ids.join(',')})`)
      .execute();
  }

  userIdentity(userId: number, roleId?: number): Promise<IUserData> {
    return this.userRepository
      .createQueryBuilder('us')
      .select([
        'us.userId as userId',
        'us.name as name',
        'us.email as email',
        'us.userName as userName',
        'us.dialCode as dialCode',
        'us.phoneNumber as phoneNumber',
        'us.emailVerified as emailVerified',
        'us.status as status',
        'r.roleName as roleName',
        'r.roleId as roleId',
        'r.roleCode as roleCode',
        'r.roleCapabilities as capabilities',
      ])
      .leftJoin(RoleMenu, 'r', 'r.roleId = us.roleId')
      .where({ userId, roleId })
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
