import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, ObjectLiteral, Repository, UpdateResult } from 'typeorm';
import _ from 'underscore';
import { AutocompleteDto, Status } from '@app/common-config/dto/common.dto';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';
import {
  ILandingPageAutoComplete,
  ILandingPageDetail,
  ILandingPageList,
  ILandingPageRecord,
} from '../../interfaces/landing-page.interface';
import { ListUtility } from '@app/utilities/list.utility';
import { LandingPage } from './entities/landing-page.entity';
import { MyCategory } from '../my-categories/entities/my-category.entity';
import { CommonService } from '@app/services/services/common-service';

@Injectable()
export class LandingPagesService {
  constructor(
    @InjectRepository(LandingPage)
    private landingPageRepository: Repository<LandingPage>,
    private listUtility: ListUtility,
    private readonly commonService: CommonService
  ) {}

  landingPageColumnAliases = (): ObjectLiteral => {
    return {
      landingPageId: 'lp.landingPageId',
      title: 'lp.title',
      content: 'lp.content',
      status: 'lp.status',
    };
  };

  async findAllLandingPages(params): Promise<ILandingPageList> {
    let paging: ISettingsParams;
    let data: ILandingPageDetail[];
    const queryObj = this.landingPageRepository
      .createQueryBuilder('lp')
      .leftJoin(MyCategory, 'c', 'c.myCategoryId = lp.categoryId');
    queryObj.where({ isDeleted: 0 });
    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['lp.title'];
    }
    const aliasList = this.landingPageColumnAliases();
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
          'lp.landingPageId as landingPageId',
          'lp.title as title',
          'lp.content as content',
          'lp.status as status',
          'lp.url as url',
          'lp.categoryId as categoryId',
          'c.categoryName as categoryName',
          'getMilliseconds(lp.addedDate) as addedDate',
          'getMilliseconds(lp.modifiedDate) as modifiedDate',
        ])
        .execute();
    }

    const queryResult = {
      paging,
      data,
    };
    return queryResult;
  }

  landingPageDetail(
    landingPageId: number,
    otherCondition?: string
  ): Promise<ILandingPageDetail> {
    const details = this.landingPageRepository
      .createQueryBuilder('lp')
      .select([
        'lp.landingPageId as landingPageId',
        'lp.title as title',
        'lp.content as content',
        'lp.status as status',
        'lp.categoryId as categoryId',
        'getMilliseconds(lp.addedDate) as addedDate',
        'getMilliseconds(lp.modifiedDate) as modifiedDate',
      ])
      .where(`lp.landingPageId = :landingPageId`, { landingPageId });

    if (otherCondition) {
      details.andWhere(otherCondition);
    }
    return details.getRawOne();
  }

  getTitleForAdd(title: string): Promise<ILandingPageRecord> {
    return this.landingPageRepository
      .createQueryBuilder('lp')
      .select('lp.landingPageId as landingPageId')
      .where({ title: title })
      .getRawOne();
  }

  createLandingPage(landingPageData: LandingPage): Promise<InsertResult> {
    const newLandingPage = this.landingPageRepository
      .createQueryBuilder()
      .insert()
      .into(LandingPage)
      .values(landingPageData)
      .execute();
    return newLandingPage;
  }

  getTitleForUpdate(title: string, id: number): Promise<ObjectLiteral> {
    const queryBuilder = this.landingPageRepository
      .createQueryBuilder('lp')
      .select(['lp.landingPageId as landingPageId']);
    if (title) {
      queryBuilder.andWhere('lp.title = :title', {
        title,
      });
    }
    if (id) {
      queryBuilder.andWhere('lp.landingPageId != :id', { id });
    }
    const data = queryBuilder.getRawOne();
    return data;
  }

  updateLandingPage(
    landingPageData: LandingPage,
    landingPageId: number
  ): Promise<UpdateResult> {
    return this.landingPageRepository
      .createQueryBuilder()
      .update(LandingPage)
      .set(landingPageData)
      .where({ landingPageId })
      .execute();
  }

  deleteLandingPage(id: number): Promise<UpdateResult> {
    return this.landingPageRepository.update(
      { landingPageId: id },
      { isDeleted: 1 }
    );
  }

  async landingPageAutocomplete(
    condition?: AutocompleteDto
  ): Promise<ILandingPageAutoComplete[]> {
    let allLandingPages = [];
    const buildQuery = (condition?: AutocompleteDto) => {
      const queryBuilder = this.landingPageRepository
        .createQueryBuilder('lp')
        .select([
          'lp.landingPageId as landingPageId',
          'lp.title as title',
          "'No' as isSystem",
        ]);

      if (condition) {
        if (condition.keyword) {
          queryBuilder.andWhere('lp.title LIKE :keyword', {
            keyword: `%${condition.keyword}%`,
          });
        }
      }

      return queryBuilder;
    };

    const companyQueryBuilder = buildQuery(condition);
    const companyLandingPage = await companyQueryBuilder.getRawMany();
    allLandingPages = [...allLandingPages, ...companyLandingPage];

    if (condition && condition.isAll === 'Yes') {
      const masterLandingPage =
        await this.commonService.getSystemLandingPage(condition);
      allLandingPages = [...allLandingPages, ...masterLandingPage];
    }

    return allLandingPages;
  }

  landingPageChangeStatus(
    ids: number[],
    status: string
  ): Promise<UpdateResult> {
    return this.landingPageRepository
      .createQueryBuilder()
      .update(LandingPage)
      .set({ status: Status[status] })
      .where(`landingPageId IN (:...ids)`, { ids })
      .execute();
  }
}
