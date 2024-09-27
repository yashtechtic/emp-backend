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
  IBlogAutoComplete,
  IBlogDetail,
  IBlogList,
  IBlogRecord,
} from '../../interfaces/blog.interface';
import { ListUtility } from '@app/utilities/list.utility';
import { Blog } from './entities/blog.entity';
import { MyCategory } from '../my-categories/entities/my-category.entity';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    private listUtility: ListUtility,
    private dataSource: DataSource
  ) {}

  getBlogColumnAliases = (): ObjectLiteral => {
    return {
      blogId: 'b.blogId',
      title: 'b.title',
      author: 'b.author',
      content: 'b.content',
      publishingDate: 'b.publishingDate',
      image: 'b.image',
      status: 'b.status',
      estimatedReadingTime: 'b.estimatedReadingTime',
      categoryId: 'b.categoryId',
    };
  };

  async findAllBlogs(params): Promise<IBlogList> {
    let paging: ISettingsParams;
    let data: IBlogDetail[];
    const queryObj = this.blogRepository
      .createQueryBuilder('b')
      .leftJoin(MyCategory, 'c', 'c.myCategoryId = b.categoryId');

    queryObj.where({ isDeleted: 0 });
    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['b.title'];
    }
    const aliasList = this.getBlogColumnAliases();
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
          'b.blogId as blogId',
          'b.title as title',
          'b.content as content',
          'b.status as status',
          'b.estimatedReadingTime as estimatedTime',
          'b.author as author',
          'b.publishingDate as publishingDate',
          'b.image as imageUrl',
          'b.categoryId as categoryId',
          'c.categoryName as categoryName',
          'getMilliseconds(b.addedDate) as addedDate',
          'getMilliseconds(b.modifiedDate) as modifiedDate',
        ])
        .addSelect('b.image as image')
        .execute();
    }

    const queryResult = {
      paging,
      data,
    };
    return queryResult;
  }

  blogDetail(blogId: number, otherCondition?: string): Promise<IBlogDetail> {
    const details = this.blogRepository
      .createQueryBuilder('b')
      .leftJoin(MyCategory, 'c', 'c.myCategoryId = b.categoryId')
      .select([
        'b.blogId as blogId',
        'b.title as title',
        'b.content as content',
        'b.status as status',
        'b.estimatedReadingTime as estimatedTime',
        'b.author as author',
        'b.publishingDate as publishingDate',
        'b.image as imageUrl',
        'b.categoryId as categoryId',
        'c.categoryName as categoryName',
        'getMilliseconds(b.addedDate) as addedDate',
        'getMilliseconds(b.modifiedDate) as modifiedDate',
      ])
      .addSelect('b.image as image')
      .where(`b.blogId = :blogId`, { blogId });

    if (otherCondition) {
      details.andWhere(otherCondition);
    }
    return details.getRawOne();
  }

  getBlogTitleForAdd(title: string): Promise<IBlogRecord> {
    return this.blogRepository
      .createQueryBuilder('b')
      .select('b.blogId as blogId')
      .where({ title: title })
      .getRawOne();
  }

  createBlog(blogData: Blog): Promise<InsertResult> {
    const newBlog = this.blogRepository
      .createQueryBuilder()
      .insert()
      .into(Blog)
      .values(blogData)
      .execute();
    return newBlog;
  }

  getBlogTitleForUpdate(title: string, id: number): Promise<ObjectLiteral> {
    const queryBuilder = this.blogRepository
      .createQueryBuilder('b')
      .select(['b.blogId as blogId']);
    if (title) {
      queryBuilder.andWhere('b.title = :title', { title });
    }
    if (id) {
      queryBuilder.andWhere('b.blogId != :id', { id });
    }
    const data = queryBuilder.getRawOne();
    return data;
  }

  updateBlog(blogData: Blog, blogId: number): Promise<UpdateResult> {
    return this.blogRepository
      .createQueryBuilder()
      .update(Blog)
      .set(blogData)
      .where(`blogId = :blogId`, { blogId })
      .execute();
  }

  deleteBlog(id): Promise<UpdateResult> {
    return this.blogRepository.update({ blogId: id }, { isDeleted: 1 });
  }

  blogAutocomplete(condition?: AutocompleteDto): Promise<IBlogAutoComplete[]> {
    const queryBuilder = this.blogRepository
      .createQueryBuilder('b')
      .select(['b.blogId as blogId', 'b.title as title']);

    if (condition) {
      if (condition.keyword) {
        queryBuilder.andWhere('b.title LIKE :keyword', {
          keyword: `%${condition.keyword}%`,
        });
      }

      if (condition.type) {
        queryBuilder.andWhere('b.status = :status', {
          status: condition.type,
        });
      }
      return queryBuilder.getRawMany();
    }
  }

  blogChangeStatus(ids: number[], status: string): Promise<UpdateResult> {
    return this.blogRepository
      .createQueryBuilder()
      .update(Blog)
      .set({ status: Status[status] })
      .where(`blogId IN (:...ids)`, { ids })
      .execute();
  }
}
