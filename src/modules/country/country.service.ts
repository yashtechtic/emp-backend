import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, ObjectLiteral, Repository, UpdateResult } from 'typeorm';
import _ from 'underscore';
import { AutocompleteDto, Status } from '@app/common-config/dto/common.dto';
import { Country } from './entities/country.entity';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';
import {
  ICountryAutoComplete,
  ICountryDetail,
  ICountryDialCode,
  ICountryList,
  ICountryRecord,
} from '../../interfaces/country.interface';
import { ListUtility } from '@app/utilities/list.utility';
import { GetCountryListDto } from './dto/country.dto';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
    private listUtility: ListUtility
  ) {}

  getCountryColumnAliases = (): ObjectLiteral => {
    return {
      countryId: 'mc.countryId',
      country: 'mc.country',
      countryCode: 'mc.countryCode',
      status: 'mc.status',
    };
  };

  async findAllCountries(params): Promise<ICountryList> {
    let paging: ISettingsParams;
    let data: ICountryDetail[];
    const queryObj = this.countryRepository.createQueryBuilder('mc');

    queryObj.where({ isDeleted: 0 });
    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['mc.country', 'mc.countryCode'];
    }
    const aliasList = this.getCountryColumnAliases();
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
          'mc.countryId as countryId',
          'mc.country as country',
          'mc.countryCode as countryCode',
          'mc.countryCodeIso3 as countryCodeIso3',
          'mc.dialCode as dialCode',
          'mc.status as status',
          'getMilliseconds(mc.addedDate) as addedDate',
          'getMilliseconds(mc.modifiedDate) as modifiedDate',
        ])
        .execute();
    }

    const queryResult = {
      paging,
      data,
    };
    return queryResult;
  }

  countryDetail(
    countryId: number,
    otherCondition?: string
  ): Promise<ICountryDetail> {
    const details = this.countryRepository
      .createQueryBuilder('mc')
      .select([
        'mc.countryId as countryId',
        'mc.country as country',
        'mc.countryCode as countryCode',
        'mc.countryCodeIso3 as countryCodeIso3',
        'mc.dialCode as dialCode',
        'mc.description as description',
        'mc.status as status',
      ])
      .where(`mc.countryId = :countryId`, { countryId });

    if (otherCondition) {
      details.andWhere(otherCondition);
    }
    return details.getRawOne();
  }

  getCountryCodeForAdd(countryCode: string): Promise<ICountryRecord> {
    return this.countryRepository
      .createQueryBuilder('mc')
      .select('mc.countryId as countryId')
      .where({ countryCode: countryCode })
      .getRawOne();
  }

  createCountry(countryData: Country): Promise<InsertResult> {
    const newCountry = this.countryRepository
      .createQueryBuilder()
      .insert()
      .into(Country)
      .values(countryData)
      .execute();
    return newCountry;
  }

  getCountryCodeForUpdate(
    countryCode: string,
    id: number
  ): Promise<ObjectLiteral> {
    const queryBuilder = this.countryRepository
      .createQueryBuilder('mc')
      .select(['mc.countryId as countryId']);
    if (countryCode) {
      queryBuilder.andWhere('mc.countryCode = :countryCode', { countryCode });
    }
    if (id) {
      queryBuilder.andWhere('mc.countryId != :id', { id });
    }
    const data = queryBuilder.getRawOne();
    return data;
  }

  updateCountry(
    countryData: Country,
    countryId: number
  ): Promise<UpdateResult> {
    return this.countryRepository
      .createQueryBuilder()
      .update(Country)
      .set(countryData)
      .where({ countryId })
      .execute();
  }

  deleteCountry(id): Promise<UpdateResult> {
    return this.countryRepository.update({ countryId: id }, { isDeleted: 1 });
  }

  countryAutocomplete(
    condition?: AutocompleteDto
  ): Promise<ICountryAutoComplete[]> {
    const queryBuilder = this.countryRepository
      .createQueryBuilder('mc')
      .select(['mc.countryId as countryId', 'mc.country as country']);

    if (condition) {
      if (condition.keyword) {
        queryBuilder.andWhere('mcy.country LIKE :keyword', {
          keyword: `%${condition.keyword}%`,
        });
      }

      if (condition.type) {
        queryBuilder.andWhere('mcy.status = :status', {
          status: condition.type,
        });
      }
      return queryBuilder.getRawMany();
    }
  }

  countryChangeStatus(ids: number[], status: string): Promise<UpdateResult> {
    return this.countryRepository
      .createQueryBuilder()
      .update(Country)
      .set({ status: Status[status] })
      .where(`countryId IN (:...ids)`, { ids })
      .execute();
  }

  getCountryDialCodes(params): Promise<ICountryDialCode[]> {
    const queryObj = this.countryRepository
      .createQueryBuilder('mc')
      .select(['mc.dialCode as dialCode', 'mc.country as country']);
    //.where(condition)

    if (params && params.keyword) {
      // /queryObj.
    }
    return queryObj.getRawMany();
  }

  getCountryList(
    queryParams: GetCountryListDto
  ): Promise<ICountryAutoComplete[]> {
    const { keyword } = queryParams;

    return this.countryRepository
      .createQueryBuilder('mc')
      .select(['mc.countryId as countryId', 'mc.vCountry as country'])
      .where('mc.country LIKE :country', { country: `%${keyword}%` })
      .andWhere('mc.status = :status', { status: 'Active' })
      .orderBy('mc.country', 'ASC')
      .getRawMany();
  }
}
