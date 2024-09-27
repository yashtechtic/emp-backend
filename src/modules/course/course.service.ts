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
import { Course } from './entities/course.entity';
import {
  ICourseDetail,
  ICourseList,
  ICourseRecord,
  ICourseAutoComplete,
} from '@app/interfaces/course.interface';
import { CommonService } from '@app/services/services/common-service';
import { MyCategory } from '../my-categories/entities/my-category.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private listUtility: ListUtility,
    private readonly commonService: CommonService
  ) {}

  getCourseColumnAlias(): ObjectLiteral {
    return {
      courseId: 'crs.courseId',
      courseTitle: 'crs.courseTitle',
      courseType: 'crs.courseType',
      description: 'crs.description',
      duration: 'crs.duration',
      isDisplayLibrary: 'crs.isDisplayLibrary',
      image: 'crs.image',
      category: 'crs.category',
      status: 'crs.status',
      addedDate: 'crs.addedDate',
      modifiedDate: 'crs.modifiedDate',
      addedBy: 'crs.addedBy',
    };
  }

  async findAllCourses(params, otherCondition?: string): Promise<ICourseList> {
    let paging: ISettingsParams;
    let data: ICourseDetail[];

    const queryObj = this.courseRepository
      .createQueryBuilder('crs')
      .leftJoin(MyCategory, 'c', 'c.myCategoryId = crs.categoryId');
    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['crs.courseTitle', 'crs.description'];
    }
    const aliasList = this.getCourseColumnAlias();
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
          'crs.courseId as courseId',
          'crs.courseTitle as courseTitle',
          'crs.courseType as courseType',
          'crs.description as description',
          'crs.duration as duration',
          'crs.isDisplayLibrary as isDisplayLibrary',
          'crs.image as image',
          'crs.categoryId as categoryId',
          'c.categoryName as categoryName',
          'crs.status as status',
          'getMilliseconds(crs.addedDate) as addedDate',
          'getMilliseconds(crs.modifiedDate) as modifiedDate',
          'crs.addedBy as addedBy',
          'crs.image as imageUrl',
        ])
        .addSelect('crs.image as image')
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

  async findOneCourse(
    courseId: number,
    otherCondition?: string
  ): Promise<ICourseDetail> {
    const course = this.courseRepository
      .createQueryBuilder('crs')
      .leftJoin(MyCategory, 'c', 'c.myCategoryId = crs.categoryId')
      .select([
        'crs.courseId as courseId',
        'crs.courseTitle as courseTitle',
        'crs.courseType as courseType',
        'crs.description as description',
        'crs.duration as duration',
        'crs.isDisplayLibrary as isDisplayLibrary',
        'crs.image as image',
        'crs.categoryId as categoryId',
        'c.categoryName as categoryName',
        'crs.status as status',
        'getMilliseconds(crs.addedDate) as addedDate',
        'getMilliseconds(crs.modifiedDate) as modifiedDate',
        'crs.addedBy as addedBy',
        'crs.image as imageUrl',
      ])
      .addSelect('crs.image as image')
      .where(`crs.courseId = :courseId`, { courseId });

    if (otherCondition) {
      course.andWhere(otherCondition);
    }

    const data = await course.getRawOne();
    return data;
  }

  checkCourseTitle(title: string, id?: number): Promise<ICourseRecord> {
    const courseTitle = this.courseRepository
      .createQueryBuilder('crs')
      .select(['crs.courseId as courseId'])
      .where({ courseTitle: title });

    if (id) {
      courseTitle.andWhere('crs.courseId != :id', { id });
    }
    return courseTitle.getRawOne();
  }

  createCourse(courseData: Course): Promise<InsertResult> {
    const newCourse = this.courseRepository
      .createQueryBuilder()
      .insert()
      .into(Course)
      .values(courseData)
      .execute();
    return newCourse;
  }

  checkCourseExists(courseId: number): Promise<ObjectLiteral> {
    return this.courseRepository.findOne({
      select: {
        courseId: true,
        courseTitle: true,
      },
      where: {
        courseId: courseId,
      },
    });
  }

  updateCourse(courseId: number, courseData: Course): Promise<UpdateResult> {
    return this.courseRepository
      .createQueryBuilder()
      .update(Course)
      .set(courseData)
      .where(`courseId = :courseId`, { courseId })
      .execute();
  }

  async deleteCourse(courseId: number): Promise<DeleteResult> {
    return this.courseRepository
      .createQueryBuilder()
      .update('Course')
      .set({ isDeleted: 1 })
      .where('courseId = :courseId', { courseId })
      .execute();
  }

  // getCourseAutocomplete(
  //   whereCond: string,
  //   keyword?: string
  // ): Promise<ICourseAutoComplete[]> {
  //   let result = this.courseRepository
  //     .createQueryBuilder('crs')
  //     .select(['crs.courseId as courseId', 'crs.courseTitle as courseTitle'])
  //     .where(whereCond);

  //   if (keyword) {
  //     result = result.andWhere(`crs.courseTitle LIKE '%${keyword}%'`);
  //   }
  //   return result.getRawMany();
  // }

  async getCourseAutocomplete(
    condition?: AutocompleteDto
  ): Promise<ICourseAutoComplete[]> {
    let allCourses = [];
    const buildQuery = (condition?: AutocompleteDto) => {
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

      return queryBuilder;
    };

    const companyQueryBuilder = buildQuery(condition);
    const companyCourses = await companyQueryBuilder.getRawMany();
    allCourses = [...allCourses, ...companyCourses];

    if (condition && condition.isAll === 'Yes') {
      const masterCourses = await this.commonService.getSystemCourse(condition);
      allCourses = [...allCourses, ...masterCourses];
    }

    return allCourses;
  }

  updateStatusCourse(
    courseIds: number[],
    status: string
  ): Promise<UpdateResult> {
    return this.courseRepository
      .createQueryBuilder()
      .update(Course)
      .set({ status: () => `'${Status[status]}'` })
      .where(`courseId IN (${courseIds.join(',')})`)
      .execute();
  }
}
