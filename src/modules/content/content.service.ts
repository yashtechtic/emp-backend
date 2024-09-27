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

import { AutocompleteDto, Status } from '@app/common-config/dto/common.dto';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';
import { ListUtility } from '@app/utilities/list.utility';
import { Content } from './entities/content.entity';
import {
  IContentAutoComplete,
  IContentDetail,
  IContentList,
  IContentRecord,
} from '@app/interfaces/content.interface';
import { CommonService } from '@app/services/services/common-service';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    private listUtility: ListUtility,
    private readonly commonService: CommonService
  ) {}

  getContentColumnAlias(): ObjectLiteral {
    return {
      contentId: 'ct.contentId',
      title: 'ct.contentTitle',
      contentType: 'ct.contentType',
      description: 'ct.vDescription',
      duration: 'ct.iDuration',
      isDisplayLibrary: 'ct.iIsDisplayLibrary',
      image: 'ct.vImage',
      status: 'ct.eStatus',
      addedDate: 'ct.dtAddedDate',
      modifiedDate: 'ct.dtModifiedDate',
      addedBy: 'ct.iAddedBy',
    };
  }

  async findAllContent(params, otherCondition?: string): Promise<IContentList> {
    let paging: ISettingsParams;
    let data: IContentDetail[];

    const queryObj = this.contentRepository.createQueryBuilder('ct');
    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['ct.contentTitle', 'ct.vDescription'];
    }
    const aliasList = this.getContentColumnAlias();
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
          'ct.contentId as contentId',
          'ct.contentTitle as title',
          'ct.contentType as contentType',
          'ct.description as description',
          'ct.duration as duration',
          'ct.isDisplayLibrary as isDisplayLibrary',
          'ct.image as imageUrl',
          'ct.status as status',
          'getMilliseconds(ct.addedDate) as addedDate',
          'getMilliseconds(ct.modifiedDate) as modifiedDate',
          'ct.addedBy as addedBy',
        ])
        .addSelect('ct.image as image')
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

  findOneContent(
    contentId: number,
    otherCondition?: string
  ): Promise<IContentDetail> {
    const content = this.contentRepository
      .createQueryBuilder('ct')
      .select([
        'ct.contentId as contentId',
        'ct.contentTitle as title',
        'ct.contentType as contentType',
        'ct.description as description',
        'ct.duration as duration',
        'ct.isDisplayLibrary as isDisplayLibrary',
        'ct.image as imageUrl',
        'ct.status as status',
        'getMilliseconds(ct.addedDate) as addedDate',
        'getMilliseconds(ct.modifiedDate) as modifiedDate',
        'ct.addedBy as addedBy',
      ])
      .addSelect('ct.image as image')
      .where(`ct.contentId = :contentId`, { contentId });

    if (otherCondition) {
      content.andWhere(otherCondition);
    }

    const data = content.getRawOne();
    return data;
  }

  checkContentTitle(title: string, id?: number): Promise<IContentRecord> {
    const contentTitle = this.contentRepository
      .createQueryBuilder('ct')
      .select(['ct.contentId as contentId'])
      .where({ contentTitle: title });

    if (id) {
      contentTitle.andWhere('ct.contentId != :id', { id });
    }
    return contentTitle.getRawOne();
  }

  createContent(contentData: Content): Promise<InsertResult> {
    const newContent = this.contentRepository
      .createQueryBuilder()
      .insert()
      .into(Content)
      .values(contentData)
      .execute();
    return newContent;
  }

  checkContentExists(contentId: number): Promise<ObjectLiteral> {
    return this.contentRepository.findOne({
      select: {
        contentId: true,
        contentTitle: true,
      },
      where: {
        contentId: contentId,
      },
    });
  }

  updateContent(
    contentId: number,
    contentData: Content
  ): Promise<UpdateResult> {
    console.log(`updateContent=====>`, contentId);
    return this.contentRepository
      .createQueryBuilder()
      .update(Content)
      .set(contentData)
      .where(`contentId = :contentId`, { contentId })
      .execute();
  }

  async deleteContent(id: number): Promise<DeleteResult> {
    return this.contentRepository
      .createQueryBuilder()
      .update('Content')
      .set({ isDeleted: 1 })
      .where('contentId = :id', { id })
      .execute();
  }

  async getContentAutocomplete(
    condition?: AutocompleteDto
  ): Promise<IContentAutoComplete[]> {
    let allContent = [];
    const buildQuery = (condition?: AutocompleteDto) => {
      const queryBuilder = this.contentRepository
        .createQueryBuilder('ct')
        .select([
          'ct.contentId as contentId',
          'ct.contentTitle as title',
          "'No' as isSystem",
        ]);
      if (condition) {
        if (condition.keyword) {
          queryBuilder.andWhere('crs.courseTitle LIKE :keyword', {
            keyword: `%${condition.keyword}%`,
          });
        }

        if (condition.type) {
          queryBuilder.andWhere('crs.status = :status', {
            status: condition.type,
          });
        }
      }

      return queryBuilder;
    };

    const companyQueryBuilder = buildQuery(condition);
    const companyContent = await companyQueryBuilder.getRawMany();
    allContent = [...allContent, ...companyContent];

    if (condition && condition.isAll === 'Yes') {
      const masterContent =
        await this.commonService.getSystemContent(condition);
      allContent = [...allContent, ...masterContent];
    }
    return allContent;
  }

  updateStatusContent(ids: number[], status: string): Promise<UpdateResult> {
    return this.contentRepository
      .createQueryBuilder()
      .update(Content)
      .set({ status: () => `'${Status[status]}'` })
      .where(`contentId IN (${ids.join(',')})`)
      .execute();
  }
}
