import { AutocompleteDto } from '@app/common-config/dto/common.dto';
import { IContentAutoComplete } from '@app/interfaces/content.interface';
import { ICourseAutoComplete } from '@app/interfaces/course.interface';
import { IDomainAutoComplete } from '@app/interfaces/domain.interface';
import { ILandingPageAutoComplete } from '@app/interfaces/landing-page.interface';
import { IMyCategoryAutoComplete } from '@app/interfaces/my-category.interface';
import { IPhishingTemplateAutoComplete } from '@app/interfaces/phising-template.interface';
import { Content } from '@app/modules/content/entities/content.entity';
import { Course } from '@app/modules/course/entities/course.entity';
import { Domain } from '@app/modules/domains/entities/domain.entity';
import { LandingPage } from '@app/modules/landing-pages/entities/landing-page.entity';
import { AutocompleteDto as CategoryAutocomplete } from '@app/modules/my-categories/dto/my-category.dto';
import { MyCategory } from '@app/modules/my-categories/entities/my-category.entity';
import { PhishingTemplate } from '@app/modules/phishing-template/entities/phishing-template.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(MyCategory, 'masterConnection')
    private readonly masterCategoryRepository: Repository<MyCategory>,
    @InjectRepository(PhishingTemplate, 'masterConnection')
    private readonly masterPhishingTemplateRepository: Repository<PhishingTemplate>,
    @InjectRepository(LandingPage, 'masterConnection')
    private readonly masterLandingPageRepository: Repository<LandingPage>,
    @InjectRepository(Domain, 'masterConnection')
    private readonly masterDomainRepository: Repository<Domain>,
    @InjectRepository(Content, 'masterConnection')
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(Course, 'masterConnection')
    private readonly courseRepository: Repository<Course>
  ) {}

  async getSystemCategory(
    condition?: CategoryAutocomplete,
    ids?: number[]
  ): Promise<IMyCategoryAutoComplete[]> {
    const queryBuilder = this.masterCategoryRepository
      .createQueryBuilder('mc')
      .select([
        'mc.myCategoryId as myCategoryId',
        'mc.categoryName as categoryName',
        "'Yes' as isSystem",
      ]);

    if (condition) {
      if (condition.keyword) {
        queryBuilder.andWhere('mc.categoryName LIKE :keyword', {
          keyword: `%${condition.keyword}%`,
        });
      }

      if (condition.categoryType) {
        queryBuilder.andWhere('mc.categoryType = :categoryType', {
          categoryType: condition.categoryType,
        });
      }
    }
    if (ids && ids.length) {
      queryBuilder.where('mc.myCategoryId IN (:...ids)', { ids });
    }
    const categories = await queryBuilder.getRawMany();
    return categories || [];
  }

  async getSystemPhishingTemplate(
    condition?: AutocompleteDto,
    ids?: number[]
  ): Promise<IPhishingTemplateAutoComplete[]> {
    const queryBuilder = this.masterPhishingTemplateRepository
      .createQueryBuilder('pt')
      .select([
        'pt.phishingTemplateId as phishingTemplateId',
        'pt.templateName as templateName',
        "'Yes' as isSystem",
      ]);

    if (condition) {
      if (condition.keyword) {
        queryBuilder.andWhere('pt.templateName LIKE :keyword', {
          keyword: `%${condition.keyword}%`,
        });
      }
    }
    if (ids && ids.length) {
      queryBuilder.where('pt.phishingTemplateId IN (:...ids)', { ids });
    }

    const phishingTemplates = await queryBuilder.getRawMany();
    return phishingTemplates || [];
  }

  async getSystemLandingPage(
    condition?: AutocompleteDto,
    ids?: number[]
  ): Promise<ILandingPageAutoComplete[]> {
    const queryBuilder = this.masterLandingPageRepository
      .createQueryBuilder('lp')
      .select([
        'lp.landingPageId as landingPageId',
        'lp.title as title',
        "'Yes' as isSystem",
      ]);

    if (condition) {
      if (condition.keyword) {
        queryBuilder.andWhere('lp.title LIKE :keyword', {
          keyword: `%${condition.keyword}%`,
        });
      }

      if (condition.type) {
        queryBuilder.andWhere('lp.status = :status', {
          status: condition.type,
        });
      }
    }
    if (ids && ids.length) {
      queryBuilder.where('lp.landingPageId IN (:...ids)', { ids });
    }
    const landingPages = await queryBuilder.getRawMany();
    return landingPages || [];
  }

  async getSystemDomain(
    condition?: AutocompleteDto,
    ids?: number[]
  ): Promise<IDomainAutoComplete[]> {
    const queryBuilder = this.masterDomainRepository
      .createQueryBuilder('d')
      .select([
        'd.domainId as domainId',
        'd.domainUrl as domainUrl',
        "'Yes' as isSystem",
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
    if (ids && ids.length) {
      queryBuilder.where('d.domainId IN (:...ids)', { ids });
    }

    const domains = await queryBuilder.getRawMany();
    return domains || [];
  }

  async getSystemContent(
    condition?: AutocompleteDto,
    ids?: number[]
  ): Promise<IContentAutoComplete[]> {
    const queryBuilder = this.contentRepository
      .createQueryBuilder('ct')
      .select([
        'ct.contentId as contentId',
        'ct.contentTitle as title',
        "'Yes' as isSystem",
      ]);

    if (condition) {
      if (condition.keyword) {
        queryBuilder.andWhere('ct.contentTitle LIKE :keyword', {
          keyword: `%${condition.keyword}%`,
        });
      }

      if (condition.type) {
        queryBuilder.andWhere('ct.status = :status', {
          status: condition.type,
        });
      }
    }
    if (ids && ids.length) {
      queryBuilder.where('ct.contentId IN (:...ids)', { ids });
    }

    const contents = await queryBuilder.getRawMany();
    return contents || [];
  }

  async getSystemCourse(
    condition?: AutocompleteDto,
    ids?: number[]
  ): Promise<ICourseAutoComplete[]> {
    const queryBuilder = this.courseRepository
      .createQueryBuilder('crs')
      .select([
        'crs.courseId as courseId',
        'crs.courseTitle as courseTitle',
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
    if (ids && ids.length) {
      queryBuilder.where('crs.courseId IN (:...ids)', { ids });
    }

    const courses = await queryBuilder.getRawMany();
    return courses || [];
  }
}
