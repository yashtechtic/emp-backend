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
import { Status } from '@app/common-config/dto/common.dto';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';
import {
  IMyCategoryAutoComplete,
  IMyCategoryDetail,
  IMyCategoryList,
  IMyCategoryRecord,
} from '../../interfaces/my-category.interface';
import { ListUtility } from '@app/utilities/list.utility';
import { MyCategory } from './entities/my-category.entity';
import { AutocompleteDto } from './dto/my-category.dto';
import tableConfig from '@app/config/table.config';
import { CommonService } from '@app/services/services/common-service';

@Injectable()
export class MyCategoriesService {
  constructor(
    @InjectRepository(MyCategory)
    private myCategoryRepository: Repository<MyCategory>,
    private listUtility: ListUtility,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService
  ) {}

  getMyCategoryColumnAliases = (): ObjectLiteral => {
    return {
      myCategoryId: 'mc.myCategoryId',
      categoryName: 'mc.categoryName',
      categoryType: 'mc.categoryType',
      status: 'mc.status',
    };
  };

  async findAllCategories(params): Promise<IMyCategoryList> {
    let paging: ISettingsParams;
    let data: IMyCategoryDetail[];
    const queryObj = this.myCategoryRepository.createQueryBuilder('mc');
    queryObj.where({ isDeleted: 0 });

    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['mc.categoryName'];
    }
    const aliasList = this.getMyCategoryColumnAliases();
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
          'mc.myCategoryId as myCategoryId',
          'mc.categoryName as categoryName',
          'mc.parentCategoryId as parentCategoryId',
          'mc.categoryType as categoryType',
          'mc.status as status',
        ])
        .execute();
    }

    const queryResult = {
      paging,
      data,
    };
    return queryResult;
  }

  myCategoryDetail(
    myCategoryId: number,
    otherCondition?: string
  ): Promise<IMyCategoryDetail> {
    const details = this.myCategoryRepository
      .createQueryBuilder('mc')
      .select([
        'mc.myCategoryId as myCategoryId',
        'mc.categoryName as categoryName',
        'mc.parentCategoryId as parentCategoryId',
        'mc.categoryType as categoryType',
        'mc.status as status',
      ])
      .where(`mc.myCategoryId = :myCategoryId`, { myCategoryId });

    if (otherCondition) {
      details.andWhere(otherCondition);
    }
    return details.getRawOne();
  }

  getCategoryNameForAdd(
    categoryName: string,
    categoryType
  ): Promise<IMyCategoryRecord> {
    return this.myCategoryRepository
      .createQueryBuilder('mc')
      .select('mc.myCategoryId as myCategoryId')
      .where({ categoryName: categoryName })
      .andWhere({ categoryType: categoryType })
      .getRawOne();
  }

  createMyCategory(myCategoryData: MyCategory): Promise<InsertResult> {
    const newCategory = this.myCategoryRepository
      .createQueryBuilder()
      .insert()
      .into(MyCategory)
      .values(myCategoryData)
      .execute();
    return newCategory;
  }

  getCategoryNameForUpdate(
    categoryName: string,
    categoryType: string,
    id: number
  ): Promise<ObjectLiteral> {
    const queryBuilder = this.myCategoryRepository
      .createQueryBuilder('mc')
      .select(['mc.myCategoryId as myCategoryId']);
    queryBuilder.where('mc.myCategoryId != :id', { id });
    if (categoryName) {
      queryBuilder.andWhere('mc.categoryName = :categoryName', {
        categoryName,
      });
      queryBuilder.andWhere('mc.categoryType = :categoryType', {
        categoryType,
      });
    }
    return queryBuilder.getRawOne();
  }

  updateMyCategory(
    categoryData: MyCategory,
    myCategoryId: number
  ): Promise<UpdateResult> {
    return this.myCategoryRepository
      .createQueryBuilder()
      .update(MyCategory)
      .set(categoryData)
      .where(`myCategoryId = :myCategoryId`, { myCategoryId })
      .execute();
  }

  deleteMyCategory(id): Promise<UpdateResult> {
    return this.myCategoryRepository.update(
      { myCategoryId: id },
      { isDeleted: 1 }
    );
  }

  async myCategoryAutocomplete(
    condition?: AutocompleteDto
  ): Promise<IMyCategoryAutoComplete[]> {
    let allCategories = [];
    const buildQuery = (condition?: AutocompleteDto) => {
      const queryBuilder = this.myCategoryRepository
        .createQueryBuilder('mc')
        .select([
          'mc.myCategoryId as myCategoryId',
          'mc.categoryName as categoryName',
          "'No' as isSystem",
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

      return queryBuilder;
    };

    const companyQueryBuilder = buildQuery(condition);
    const companyCategories = await companyQueryBuilder.getRawMany();
    allCategories = [...allCategories, ...companyCategories];

    if (condition && condition.isAll === 'Yes') {
      const masterCategories =
        await this.commonService.getSystemCategory(condition);
      allCategories = [...allCategories, ...masterCategories];
    }

    return allCategories;
  }

  myCategoryChangeStatus(ids: number[], status: string): Promise<UpdateResult> {
    return this.myCategoryRepository
      .createQueryBuilder()
      .update(MyCategory)
      .set({ status: Status[status] })
      .where(`myCategoryId IN (:...ids)`, { ids })
      .execute();
  }

  async updateModuleCategory(body: any): Promise<UpdateResult> {
    const { ids, categoryId, categoryType } = body;
    const { tableName, primaryKey } = tableConfig[categoryType];
    if (!tableName) {
      throw new Error(`Invalid categoryType: ${categoryType}`);
    }

    const queryBuilder = this.dataSource.createQueryBuilder();
    return queryBuilder
      .update(tableName)
      .set({ categoryId })
      .where(`${primaryKey} IN (:...ids)`, { ids })
      .execute();
  }
}
