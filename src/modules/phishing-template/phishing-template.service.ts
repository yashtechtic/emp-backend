import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, ObjectLiteral, Repository, UpdateResult } from 'typeorm';
import _ from 'underscore';
import { AutocompleteDto, Status } from '@app/common-config/dto/common.dto';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';
import {
  IPhishingTemplateDetail,
  IPhishingTemplateList,
  IPhishingTemplateRecord,
} from '../../interfaces/phising-template.interface';
import { ListUtility } from '@app/utilities/list.utility';
import { PhishingTemplate } from './entities/phishing-template.entity';
import { LandingPage } from '../landing-pages/entities/landing-page.entity';
import { Domain } from '../domains/entities/domain.entity';
import { MyCategory } from '../my-categories/entities/my-category.entity';
import { CommonService } from '@app/services/services/common-service';

@Injectable()
export class PhishingTemplatesService {
  constructor(
    @InjectRepository(PhishingTemplate)
    private phishingTemplateRepository: Repository<PhishingTemplate>,
    private listUtility: ListUtility,
    private readonly commonService: CommonService
  ) {}

  phishingTemplateColumnAliases = (): ObjectLiteral => {
    return {
      templateName: 'pt.templateName',
      senderEmail: 'pt.senderEmail',
      senderName: 'pt.senderName',
      replyToName: 'pt.replyToName',
      replyToEmail: 'pt.replyToEmail',
      subject: 'pt.subject',
      landingPageId: 'pt.landingPageId',
      domainId: 'pt.domainId',
      landingPage: 'lp.title',
      domain: 'd.domainUrl',
      difficultyRating: 'pt.difficultyRating',
      categoryId: 'pt.categoryId',
      category: 'c.categoryName',
      status: 'pt.status',
      modifiedDate: 'pt.modifiedDate',
    };
  };

  async findAllPhishingTemplates(params): Promise<IPhishingTemplateList> {
    let paging: ISettingsParams;
    let data: IPhishingTemplateDetail[];
    const queryObj = this.phishingTemplateRepository
      .createQueryBuilder('pt')
      .leftJoin(LandingPage, 'lp', 'lp.landingPageId = pt.landingPageId')
      .leftJoin(Domain, 'd', 'd.domainId = pt.domainId')
      .leftJoin(MyCategory, 'c', 'c.myCategoryId = pt.categoryId');
    queryObj.where({ isDeleted: 0 });

    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['pt.templateName', 'pt.subject'];
    }
    const aliasList = this.phishingTemplateColumnAliases();
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
          'pt.phishingTemplateId as phishingTemplateId',
          'pt.templateName as templateName',
          'pt.status as status',
          'getMilliseconds(pt.addedDate) as addedDate',
          'getMilliseconds(pt.modifiedDate) as modifiedDate',
          'pt.subject as subject',
          'pt.landingPageId as landingPageId',
          'lp.title as landingPage',
          'pt.domainId as domainId',
          'd.domainUrl as domainUrl',
          'pt.categoryId as categoryId',
          'c.categoryName as category',
          'pt.difficultyRating as difficultyRating',
          'pt.isSystemDomain as isSystemDomain',
          'pt.isSystemLandingPage as isSystemLandingPage',
        ])
        .execute();

      if (data && data.length > 0 && params.isAll === 'Yes') {
        const systemLandingPage =
          await this.commonService.getSystemLandingPage();
        const systemDomain = await this.commonService.getSystemDomain();
        data.forEach((element) => {
          if (element.isSystemDomain) {
            const domain = systemDomain.find(
              (d) => d.domainId === element.domainId
            );
            if (domain) {
              element.domainUrl = domain.domainUrl;
            }
          }

          if (element.isSystemLandingPage) {
            const landingPage = systemLandingPage.find(
              (lp) => lp.landingPageId === element.landingPageId
            );
            if (landingPage) {
              element.title = landingPage.title;
            }
          }
        });
      }
    }

    const queryResult = {
      paging,
      data,
    };
    return queryResult;
  }

  async phishingTemplateDetail(
    phishingTemplateId: number,
    otherCondition?: string
  ): Promise<IPhishingTemplateDetail> {
    const details = this.phishingTemplateRepository
      .createQueryBuilder('pt')
      .leftJoin(LandingPage, 'lp', 'lp.landingPageId = pt.landingPageId')
      .leftJoin(Domain, 'd', 'd.domainId = pt.domainId')
      .leftJoin(MyCategory, 'c', 'c.myCategoryId = pt.categoryId')
      .select([
        'pt.phishingTemplateId as phishingTemplateId',
        'pt.templateName as templateName',
        'pt.status as status',
        'getMilliseconds(pt.addedDate) as addedDate',
        'getMilliseconds(pt.modifiedDate) as modifiedDate',
        'pt.subject as subject',
        'pt.landingPageId as landingPageId',
        'lp.title as landingPage',
        'pt.domainId as domainId',
        'd.domainUrl as domainUrl',
        'pt.categoryId as categoryId',
        'c.categoryName as category',
        'pt.senderEmail as senderEmail',
        'pt.senderName as senderName',
        'pt.replyToName as replyToName',
        'pt.replyToEmail as replyToEmail',
        'pt.difficultyRating as difficultyRating',
        'pt.file as file',
        'pt.fileType as fileType',
        'pt.isEditingOption as isEditingOption',
        'pt.addedBy as addedBy',
        'pt.fileContent as fileContent',
        'pt.isSystemDomain as isSystemDomain',
        'pt.isSystemLandingPage as isSystemLandingPage',
      ])
      .where(`pt.phishingTemplateId = :phishingTemplateId`, {
        phishingTemplateId,
      });

    if (otherCondition) {
      details.andWhere(otherCondition);
    }
    const phishingTemplateDetail = await details.getRawOne();
    if (phishingTemplateDetail) {
      const systemLandingPage = await this.commonService.getSystemLandingPage(
        undefined,
        [phishingTemplateDetail.landingPageId]
      );
      const systemDomain = await this.commonService.getSystemDomain(undefined, [
        phishingTemplateDetail.domainId,
      ]);
      if (phishingTemplateDetail.isSystemDomain) {
        if (systemDomain) {
          phishingTemplateDetail.domainUrl = systemDomain[0].domainUrl;
        }
      }

      if (phishingTemplateDetail.isSystemLandingPage) {
        if (systemLandingPage) {
          phishingTemplateDetail.title = systemLandingPage[0].title;
        }
      }
    }
    return phishingTemplateDetail;
  }

  getTemplateNameForAdd(
    templateName: string
  ): Promise<IPhishingTemplateRecord> {
    return this.phishingTemplateRepository
      .createQueryBuilder('pt')
      .select('pt.phishingTemplateId as phishingTemplateId')
      .where({ templateName: templateName })
      .getRawOne();
  }

  createPhishingTemplate(
    phishingTemplateData: PhishingTemplate
  ): Promise<InsertResult> {
    const newPhishingTemplate = this.phishingTemplateRepository
      .createQueryBuilder()
      .insert()
      .into(PhishingTemplate)
      .values(phishingTemplateData)
      .execute();
    return newPhishingTemplate;
  }

  getTemplateNameForUpdate(
    templateName: string,
    id: number
  ): Promise<ObjectLiteral> {
    const queryBuilder = this.phishingTemplateRepository
      .createQueryBuilder('pt')
      .select(['pt.phishingTemplateId as phishingTemplateId']);
    if (templateName) {
      queryBuilder.andWhere('pt.templateName = :templateName', {
        templateName,
      });
    }
    if (id) {
      queryBuilder.andWhere('pt.phishingTemplateId != :id', { id });
    }
    const data = queryBuilder.getRawOne();
    return data;
  }

  updatePhishingTemplate(
    phishingTemplateData: PhishingTemplate,
    phishingTemplateId: number
  ): Promise<UpdateResult> {
    return this.phishingTemplateRepository
      .createQueryBuilder()
      .update(PhishingTemplate)
      .set(phishingTemplateData)
      .where({ phishingTemplateId })
      .execute();
  }

  deletePhishingTemplate(id: number): Promise<UpdateResult> {
    return this.phishingTemplateRepository
      .createQueryBuilder()
      .update(PhishingTemplate)
      .set({ isDeleted: 1 })
      .where('phishingTemplateId = :id', { id })
      .execute();
  }

  // phishingTemplateAutocomplete(
  //   condition?: AutocompleteDto
  // ): Promise<IPhishingTemplateRecord[]> {
  //   const queryBuilder = this.phishingTemplateRepository
  //     .createQueryBuilder('pt')
  //     .select([
  //       'pt.phishingTemplateId as phishingTemplateId',
  //       'pt.templateName as templateName',
  //     ]);

  //   if (condition) {
  //     if (condition.keyword) {
  //       queryBuilder.andWhere('pt.templateName LIKE :keyword', {
  //         keyword: `%${condition.keyword}%`,
  //       });
  //     }

  //     if (condition.type) {
  //       queryBuilder.andWhere('pt.status = :status', {
  //         status: condition.type,
  //       });
  //     }
  //     return queryBuilder.getRawMany();
  //   }
  // }

  async phishingTemplateAutocomplete(
    condition?: AutocompleteDto
  ): Promise<IPhishingTemplateRecord[]> {
    let allPhishingTemplate = [];
    const buildQuery = (condition?: AutocompleteDto) => {
      const queryBuilder = this.phishingTemplateRepository
        .createQueryBuilder('pt')
        .select([
          'pt.phishingTemplateId as phishingTemplateId',
          'pt.templateName as templateName',
        ]);

      if (condition) {
        if (condition.keyword) {
          queryBuilder.andWhere('pt.templateName LIKE :keyword', {
            keyword: `%${condition.keyword}%`,
          });
        }

        if (condition.type) {
          queryBuilder.andWhere('pt.status = :status', {
            status: condition.type,
          });
        }
      }

      return queryBuilder;
    };

    const companyQueryBuilder = buildQuery(condition);
    const companyPhishingTemplate = await companyQueryBuilder.getRawMany();
    allPhishingTemplate = [...allPhishingTemplate, ...companyPhishingTemplate];

    if (condition && condition.isAll === 'Yes') {
      const masterPhishingTemplate =
        await this.commonService.getSystemPhishingTemplate(condition);
      allPhishingTemplate = [...allPhishingTemplate, ...masterPhishingTemplate];
    }

    return allPhishingTemplate;
  }

  phishingTemplateChangeStatus(
    ids: number[],
    status: string
  ): Promise<UpdateResult> {
    return this.phishingTemplateRepository
      .createQueryBuilder()
      .update(PhishingTemplate)
      .set({ status: Status[status] })
      .where(`phishingTemplateId IN (:...ids)`, { ids })
      .execute();
  }
}
