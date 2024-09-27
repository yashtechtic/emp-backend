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
import { City } from './entities/city.entity';
import { Country } from '../country/entities/country.entity';
import { State } from '../state/entities/state.entity';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';
import {
  ICityAutoComplete,
  ICityData,
  ICityList,
} from '../../interfaces/city.interface';
import { ListUtility } from '@app/utilities/list.utility';
import { CityAutocompleteDto } from './dto/city.dto';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City) private cityRepository: Repository<City>,
    @InjectRepository(State) private stateRepository: Repository<State>,
    private listUtility: ListUtility
  ) {}

  getCityColumnAliases = (): ObjectLiteral => {
    return {
      cityId: 'mcy.cityId',
      city: 'mcy.city',
      cityCode: 'mcy.cityCode',
      latitude: 'mcy.latitude',
      longitude: 'mcy.longitude',
      countryId: 'mcy.countryId',
      stateId: 'mcy.stateId',
      status: 'mcy.status',
    };
  };

  async findAllCitys(params): Promise<ICityList> {
    let paging: ISettingsParams;
    let data: ICityData[];
    const queryObj = this.cityRepository
      .createQueryBuilder('mcy')
      .leftJoin(Country, 'mc', 'mc.countryId = mcy.countryId')
      .leftJoin(State, 'ms', 'ms.stateId = mcy.stateId');

    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['mcy.city', 'mcy.cityCode'];
    }
    const aliasList = this.getCityColumnAliases();
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
          'mcy.cityId as cityId',
          'mcy.cityCode as cityCode',
          'mcy.city as city',
          'mcy.status as status',
          'mc.country as country',
          'mcy.countryId as countryId',
          'mcy.stateId as stateId',
          'ms.state as state',
        ])
        .execute();
    }

    const queryResult = {
      paging,
      data,
    };
    return queryResult;
  }

  cityDetail(cityId: number, otherCondition?: string): Promise<ICityData> {
    const details = this.cityRepository
      .createQueryBuilder('mcy')
      .leftJoin(Country, 'mc', 'mc.countryId = mcy.countryId')
      .leftJoin(State, 'ms', 'ms.stateId = mcy.stateId')
      .select([
        'mcy.cityId as cityId',
        'mcy.city as city',
        'mcy.cityCode as cityCode',
        'mcy.status as status',
        'mc.countryId as countryId',
        'mc.country as country',
        'mcy.stateId as stateId',
        'ms.state as state',
      ])
      .where(`mcy.cityId = :cityId`, { cityId });

    if (otherCondition) {
      details.andWhere(otherCondition);
    }
    return details.getRawOne();
  }

  getCityStateForAdd(
    stateId: number,
    countryId: number
  ): Promise<ObjectLiteral | null> {
    return this.stateRepository.findOne({
      select: {
        stateId: true,
      },
      where: { countryId, stateId },
    });
  }

  getCityCodeForAdd(
    cityCode: string,
    countryId: number,
    stateId: number
  ): Promise<ObjectLiteral | undefined> {
    return this.cityRepository.findOne({
      select: {
        cityId: true,
      },
      where: {
        cityCode,
        countryId,
        stateId,
      },
    });
  }

  createCity(CityData: City): Promise<InsertResult> {
    const newState = this.cityRepository
      .createQueryBuilder()
      .insert()
      .into(City)
      .values(CityData)
      .execute();
    return newState;
  }

  getCityStateForUpdate(
    countryId: number,
    stateId: number
  ): Promise<ObjectLiteral | null> {
    return this.stateRepository.findOne({
      select: {
        stateId: true,
      },
      where: { countryId, stateId },
    });
  }

  async getCityCodeForUpdate(
    cityCode: string,
    countryId: number,
    stateId: number,
    id: number
  ): Promise<ObjectLiteral | null> {
    return this.cityRepository.findOne({
      select: { cityId: true },
      where: {
        cityCode,
        countryId,
        stateId,
        cityId: Not(id),
      },
    });
  }

  updateCity(userData: City, cityId: number): Promise<UpdateResult> {
    return this.cityRepository
      .createQueryBuilder()
      .update(City)
      .set(userData)
      .where({ cityId })
      .execute();
  }

  deleteCity(id: number): Promise<DeleteResult> {
    return this.cityRepository.update({ cityId: id }, { isDeleted: 1 });
  }

  cityAutocomplete(
    condition?: CityAutocompleteDto
  ): Promise<ICityAutoComplete[]> {
    const queryBuilder = this.cityRepository
      .createQueryBuilder('mcy')
      .select(['mcy.cityId as cityId', 'mcy.city as city']);

    if (condition) {
      if (condition.keyword) {
        queryBuilder.andWhere('mcy.city LIKE :keyword', {
          keyword: `%${condition.keyword}%`,
        });
      }

      if (condition.type) {
        queryBuilder.andWhere('mcy.status = :status', {
          status: condition.type,
        });
      }

      if (condition.countryId) {
        queryBuilder.andWhere('mcy.countryId = :countryId', {
          countryId: condition.countryId,
        });
      }

      if (condition.stateId) {
        queryBuilder.andWhere('mcy.stateId = :stateId', {
          stateId: condition.stateId,
        });
      }
    }
    return queryBuilder.getRawMany();
  }

  cityChangeStatus(ids: number[], status: string): Promise<UpdateResult> {
    return this.cityRepository
      .createQueryBuilder()
      .update(City)
      .set({ status: Status[status] })
      .where(`cityId IN (:...ids)`, { ids })
      .execute();
  }
}
