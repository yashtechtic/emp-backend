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

import { Custom } from '@app/utilities/custom.utility';
import { Status } from '@app/common-config/dto/common.dto';
import { State } from './entities/state.entity';
import { Country } from '../country/entities/country.entity';
import { GetStateListDto } from './dto/state.dto';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';
import {
  IStateAutoComplete,
  IStateData,
  IStateList,
} from '../../interfaces/state.interface';
import { ListUtility } from '@app/utilities/list.utility';

@Injectable()
export class StateService {
  constructor(
    @InjectRepository(State) private stateRepository: Repository<State>,
    @InjectRepository(Country) private countryRepository: Repository<Country>,
    private listUtility: ListUtility
  ) {}

  getStateColumnAliases = (): ObjectLiteral => {
    return {
      stateId: 'ms.stateId',
      state: 'ms.state',
      stateCode: 'ms.stateCode',
      countryId: 'ms.countryId',
      status: 'ms.status',
      modifiedDate: 'ms.modifiedDate',
      addedDate: 'ms.addedDate',
    };
  };

  async findAllStates(params): Promise<IStateList> {
    let paging: ISettingsParams;
    let data: IStateData[];

    const queryObj = this.stateRepository
      .createQueryBuilder('ms')
      .leftJoin(Country, 'mc', 'mc.countryId = ms.countryId');

    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['ms.state'];
    }
    const aliasList = this.getStateColumnAliases();
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
          'ms.stateId as stateId',
          'ms.state as state',
          'ms.stateCode as stateCode',
          'ms.countryId as countryId',
          'mc.country as country',
          'mc.countryCode as countryCode',
          'ms.status as status',
        ])
        .execute();
    }

    const queryResult = {
      paging,
      data,
    };
    return queryResult;
  }

  stateDetail(
    value: any,
    columnName: string,
    otherCondition?: string
  ): Promise<IStateData> {
    const details = this.stateRepository
      .createQueryBuilder('ms')
      .leftJoin(Country, 'mc', 'mc.countryId = ms.countryId')
      .select([
        'ms.stateId as stateId',
        'ms.state as state',
        'ms.stateCode as stateCode',
        'mc.countryId as countryId',
        'mc.country as country',
        'mc.countryCode as countryCode',
        'ms.status as status',
      ])
      .where(`ms.${columnName} = :value`, { value });

    if (otherCondition) {
      details.andWhere(otherCondition);
    }
    return details.getRawOne();
  }

  getStateCountryForAdd(countryId: number): Promise<ObjectLiteral> {
    return this.countryRepository.findOne({
      select: {
        countryId: true,
      },
      where: {
        countryId: countryId,
      },
    });
  }

  getStateCodeForAdd(
    stateCode: string,
    countryId: number
  ): Promise<ObjectLiteral | null> {
    return this.stateRepository.findOne({
      select: {
        stateId: true,
      },
      where: {
        stateCode: stateCode,
        countryId: countryId,
      },
    });
  }

  createState(stateData: State): Promise<InsertResult> {
    const newState = this.stateRepository
      .createQueryBuilder()
      .insert()
      .into(State)
      .values(stateData)
      .execute();
    return newState;
  }

  getStateCountryForUpdate(countryId: number): Promise<ObjectLiteral> {
    return this.countryRepository.findOne({
      select: {
        countryId: true,
      },
      where: {
        countryId: countryId,
      },
    });
  }

  getStateCodeForUpdate(
    stateCode: string,
    id: number,
    countryId: number
  ): Promise<ObjectLiteral | null> {
    return this.stateRepository.findOne({
      select: {
        stateId: true,
      },
      where: {
        stateCode: stateCode,
        countryId: countryId,
        stateId: Not(id),
      },
    });
  }

  updateState(
    userData: State,
    columnName: string,
    value: any
  ): Promise<UpdateResult> {
    return this.stateRepository
      .createQueryBuilder()
      .update(State)
      .set(userData)
      .where(`${columnName} = :value`, { value })
      .execute();
  }

  deleteState(id): Promise<DeleteResult> {
    return this.stateRepository.update({ stateId: id }, { isDeleted: 1 });
  }

  stateAutocomplete(where_cond?: string): Promise<IStateAutoComplete[]> {
    let result = this.stateRepository
      .createQueryBuilder('ms')
      .select(['ms.stateId as stateId', 'ms.state as state']);

    if (where_cond) {
      result = result.where(where_cond);
    }
    return result.getRawMany();
  }

  stateChangeStatus(ids: number[], status: string): Promise<UpdateResult> {
    return this.stateRepository
      .createQueryBuilder()
      .update(State)
      .set({ status: () => `'${Status[status]}'` })
      .where(`stateId IN (${ids.join(',')})`)
      .execute();
  }

  getAllStates(queryParams: GetStateListDto): Promise<IStateAutoComplete[]> {
    const { countryId, keyword } = queryParams;

    const queryBuilder = this.stateRepository
      .createQueryBuilder('ms')
      .select(['ms.stateId as stateId', 'ms.state as state'])
      .andWhere('ms.eStatus IN (:...status)', { status: ['Active'] })
      .addOrderBy('ms.vState', 'ASC');

    if (countryId) {
      queryBuilder.andWhere('ms.countryId = :countryId', { countryId });
    }

    if (keyword) {
      queryBuilder.andWhere('ms.state LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    return queryBuilder.getRawMany();
  }
}
