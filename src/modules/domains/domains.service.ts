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
  IDomainAutoComplete,
  IDomainDetail,
  IDomainList,
  IDomainRecord,
} from '../../interfaces/domain.interface';
import { ListUtility } from '@app/utilities/list.utility';
import { Domain } from './entities/domain.entity';
import { RootDomain } from './entities/root-domain.entity';
import { CommonService } from '@app/services/services/common-service';

@Injectable()
export class DomainsService {
  private readonly employeeDataSource: DataSource;

  constructor(
    @InjectRepository(Domain)
    private domainRepository: Repository<Domain>,
    @InjectRepository(RootDomain, 'masterConnection')
    private readonly rootDomainRepository: Repository<RootDomain>,
    private listUtility: ListUtility,
    private commonService: CommonService
  ) {}

  getDomainColumnAliases = (): ObjectLiteral => {
    return {
      domainId: 'd.domainId',
      domainUrl: 'd.domainUrl',
      rootDomain: 'd.rootDomain',
      domainType: 'd.domainType',
      status: 'd.status',
    };
  };

  async findAllDomains(params): Promise<IDomainList> {
    let paging: ISettingsParams;
    let data: IDomainDetail[];
    const queryObj = this.domainRepository.createQueryBuilder('d');
    queryObj.where({ isDeleted: 0 });

    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['d.domainUrl', 'd.rootDomain'];
    }
    const aliasList = this.getDomainColumnAliases();
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
          'd.domainId as domainId',
          'd.domainUrl as domainUrl',
          'd.rootDomainId as rootDomainId',
          'd.domainType as domainType',
          'd.status as status',
          'getMilliseconds(d.addedDate) as addedDate',
          'getMilliseconds(d.modifiedDate) as modifiedDate',
        ])
        .execute();

      if (data && data.length) {
        const rootDomains = await this.rootDomainRepository
          .createQueryBuilder('rd')
          .select([
            'rd.rootDomainId as rootDomainId',
            'rd.rootDomainUrl as rootDomainUrl',
          ])
          .execute();
        data = data.map((d) => ({
          ...d,
          rootDomainUrl:
            rootDomains.find((rd) => rd.rootDomainId === d.rootDomainId)
              ?.rootDomainUrl || null,
        }));
      }
    }

    const queryResult = {
      paging,
      data,
    };
    return queryResult;
  }

  domainDetail(
    domainId: number,
    otherCondition?: string
  ): Promise<IDomainDetail> {
    const details = this.domainRepository
      .createQueryBuilder('d')
      .select([
        'd.domainId as domainId',
        'd.domainUrl as domainUrl',
        'd.rootDomain as rootDomain',
        'd.domainType as domainType',
        'd.status as status',
      ])
      .where(`d.domainId = :domainId`, { domainId });

    if (otherCondition) {
      details.andWhere(otherCondition);
    }
    return details.getRawOne();
  }

  getDomainUrlForAdd(domainUrl: string): Promise<IDomainRecord> {
    return this.domainRepository
      .createQueryBuilder('d')
      .select('d.domainId as domainId')
      .where({ domainUrl: domainUrl })
      .getRawOne();
  }

  createDomain(domainData: Domain): Promise<InsertResult> {
    const newDomain = this.domainRepository
      .createQueryBuilder()
      .insert()
      .into(Domain)
      .values(domainData)
      .execute();
    return newDomain;
  }

  getDomainUrlForUpdate(domainUrl: string, id: number): Promise<ObjectLiteral> {
    const queryBuilder = this.domainRepository
      .createQueryBuilder('d')
      .select(['d.domainId as domainId']);
    if (domainUrl) {
      queryBuilder.andWhere('d.domainUrl = :domainUrl', {
        domainUrl,
      });
    }
    if (id) {
      queryBuilder.andWhere('d.domainId != :id', { id });
    }
    const data = queryBuilder.getRawOne();
    return data;
  }

  updateDomain(domainData: Domain, domainId: number): Promise<UpdateResult> {
    return this.domainRepository
      .createQueryBuilder()
      .update(Domain)
      .set(domainData)
      .where({ domainId })
      .execute();
  }

  deleteDomain(id: number): Promise<UpdateResult> {
    return this.domainRepository.update({ domainId: id }, { isDeleted: 1 });
  }

  // domainAutocomplete(
  //   condition?: AutocompleteDto
  // ): Promise<IDomainAutoComplete[]> {
  //   const queryBuilder = this.domainRepository
  //     .createQueryBuilder('d')
  //     .select(['d.domainId as domainId', 'd.domainUrl as domainUrl']);

  //   if (condition) {
  //     if (condition.keyword) {
  //       queryBuilder.andWhere('d.domainUrl LIKE :keyword', {
  //         keyword: `%${condition.keyword}%`,
  //       });
  //     }

  //     if (condition.type) {
  //       queryBuilder.andWhere('d.status = :status', {
  //         status: condition.type,
  //       });
  //     }
  //     return queryBuilder.getRawMany();
  //   }
  // }

  async domainAutocomplete(
    condition?: AutocompleteDto
  ): Promise<IDomainAutoComplete[]> {
    let allDomains = [];
    const buildQuery = (condition?: AutocompleteDto) => {
      const queryBuilder = this.domainRepository
        .createQueryBuilder('d')
        .select([
          'd.domainId as domainId',
          'd.domainUrl as domainUrl',
          "'No' as isSystem",
        ]);

      if (condition) {
        if (condition.keyword) {
          queryBuilder.andWhere('d.domainUrl LIKE :keyword', {
            keyword: `%${condition.keyword}%`,
          });
        }

        if (condition.type) {
          queryBuilder.andWhere('d.status = :status', {
            status: condition.type,
          });
        }
      }

      return queryBuilder;
    };

    const companyQueryBuilder = buildQuery(condition);
    const companyDomains = await companyQueryBuilder.getRawMany();
    allDomains = [...allDomains, ...companyDomains];

    if (condition && condition.isAll === 'Yes') {
      const masterDomains = await this.commonService.getSystemDomain(condition);
      allDomains = [...allDomains, ...masterDomains];
    }

    return allDomains;
  }

  async rootDomainAutocomplete(): Promise<any[]> {
    const queryBuilder = this.rootDomainRepository
      .createQueryBuilder('rd')
      .select([
        'rd.rootDomainId as rootDomainId',
        'rd.rootDomainUrl as rootDomainUrl',
      ]);

    return queryBuilder.getRawMany();
  }

  domainChangeStatus(ids: number[], status: string): Promise<UpdateResult> {
    return this.domainRepository
      .createQueryBuilder()
      .update(Domain)
      .set({ status: Status[status] })
      .where(`domainId IN (:...ids)`, { ids })
      .execute();
  }
}
