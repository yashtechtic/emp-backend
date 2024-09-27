import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  InsertResult,
  ObjectLiteral,
  Repository,
  UpdateResult,
} from 'typeorm';
import _ from 'underscore';
import { AutocompleteDto, Status } from '@app/common-config/dto/common.dto';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';
import {
  IPolicyAutoComplete,
  IPolicyDetail,
  IPolicyList,
  IPolicyRecord,
} from '../../interfaces/policy.interface';
import { ListUtility } from '@app/utilities/list.utility';
import { Policy } from './entities/policy.entity';

@Injectable()
export class PoliciesService {
  constructor(
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
    private listUtility: ListUtility,
    private dataSource: DataSource
  ) {}

  policyColumnAliases = (): ObjectLiteral => {
    return {
      policyId: 'p.policyId',
      title: 'p.title',
      description: 'p.description',
      startDate: 'p.startDate',
      endDate: 'p.endDate',
    };
  };

  async findAllPolicies(params): Promise<IPolicyList> {
    let paging: ISettingsParams;
    let data: IPolicyDetail[];
    const queryObj = this.policyRepository.createQueryBuilder('p');
    queryObj.where({ isDeleted: 0 });
    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['p.title', 'p.description'];
    }
    const aliasList = this.policyColumnAliases();
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
          'p.policyId as policyId',
          'p.title as title',
          'p.description as description',
          'p.document as document',
          'p.document as documentUrl',
          'getMilliseconds(p.startDate) as startDate',
          'getMilliseconds(p.endDate) as endDate',
          'getMilliseconds(p.addedDate) as addedDate',
          'getMilliseconds(p.modifiedDate) as modifiedDate',
        ])
        .execute();
    }

    const queryResult = {
      paging,
      data,
    };
    return queryResult;
  }

  policyDetail(
    policyId: number,
    otherCondition?: string
  ): Promise<IPolicyDetail> {
    const details = this.policyRepository
      .createQueryBuilder('p')
      .select([
        'p.policyId as policyId',
        'p.title as title',
        'p.description as description',
        'p.document as document',
        'p.document as documentUrl',
        'getMilliseconds(p.startDate) as startDate',
        'getMilliseconds(p.endDate) as endDate',
        'getMilliseconds(p.addedDate) as addedDate',
        'getMilliseconds(p.modifiedDate) as modifiedDate',
      ])
      .where('p.policyId = :policyId', {
        policyId,
      });

    if (otherCondition) {
      details.andWhere(otherCondition);
    }
    return details.getRawOne();
  }

  getTitleForAdd(title: string): Promise<IPolicyRecord> {
    return this.policyRepository
      .createQueryBuilder('p')
      .select('p.policyId as policyId')
      .where({ title: title })
      .getRawOne();
  }

  async createPolicy(policyData: Policy): Promise<InsertResult> {
    const { startDate, endDate, ...rest } = policyData;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    return queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Policy)
      .values({
        ...rest,
        startDate: startDate
          ? () => `FROM_UNIXTIME(${Number(startDate) / 1000})`
          : undefined,
        endDate: endDate
          ? () => `FROM_UNIXTIME(${Number(endDate) / 1000})`
          : undefined,
      })
      .execute();
  }

  getTitleForUpdate(title: string, id: number): Promise<ObjectLiteral> {
    const queryBuilder = this.policyRepository
      .createQueryBuilder('p')
      .select(['p.policyId as policyId']);
    if (title) {
      queryBuilder.andWhere('p.title = :title', {
        title,
      });
    }
    if (id) {
      queryBuilder.andWhere('p.policyId != :id', { id });
    }
    const data = queryBuilder.getRawOne();
    return data;
  }

  async updatePolicy(
    policyData: Policy,
    policyId: number
  ): Promise<UpdateResult> {
    const { startDate, endDate, ...rest } = policyData;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    return queryRunner.manager
      .createQueryBuilder()
      .update(Policy)
      .set({
        ...rest,
        startDate: startDate
          ? () => `FROM_UNIXTIME(${Number(startDate) / 1000})`
          : undefined,
        endDate: endDate
          ? () => `FROM_UNIXTIME(${Number(endDate) / 1000})`
          : undefined,
      })
      .where({ policyId })
      .execute();
  }

  deletePolicy(id: number): Promise<UpdateResult> {
    return this.policyRepository.update({ policyId: id }, { isDeleted: 1 });
  }

  policyAutocomplete(
    condition?: AutocompleteDto
  ): Promise<IPolicyAutoComplete[]> {
    const queryBuilder = this.policyRepository
      .createQueryBuilder('p')
      .select(['p.policyId as policyId', 'p.title as title']);

    if (condition) {
      if (condition.keyword) {
        queryBuilder.andWhere('p.title LIKE :keyword', {
          keyword: `%${condition.keyword}%`,
        });
      }

      if (condition.type) {
        queryBuilder.andWhere('p.status = :status', {
          status: condition.type,
        });
      }
    }
    return queryBuilder.getRawMany();
  }

  policyChangeStatus(ids: number[], status: string): Promise<UpdateResult> {
    return this.policyRepository
      .createQueryBuilder()
      .update(Policy)
      .set({ status: Status[status] })
      .where('policyId IN (:...ids)', { ids })
      .execute();
  }
}
