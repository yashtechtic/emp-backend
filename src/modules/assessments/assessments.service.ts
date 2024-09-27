import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  InsertResult,
  Repository,
  UpdateResult,
  ObjectLiteral,
} from 'typeorm';
import _ from 'underscore';
import { Assessment } from './entities/assessment.entity';
import { AssessmentQuestion } from './entities/assessment-question.entity';
import { AssessmentQuestionOption } from './entities/assessment-qs-options.entity';
import { ListUtility } from '@app/utilities/list.utility';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';
import { AutocompleteDto, Status } from '@app/common-config/dto/common.dto';
import {
  IAssessmentList,
  IAssessmentDetail,
  IAssessmentAutoComplete,
} from '../../interfaces/assessment.interface';

@Injectable()
export class AssessmentService {
  constructor(
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
    @InjectRepository(AssessmentQuestion)
    private assessmentQuestionRepository: Repository<AssessmentQuestion>,
    @InjectRepository(AssessmentQuestionOption)
    private assessmentQuestionOptionRepository: Repository<AssessmentQuestionOption>,
    private listUtility: ListUtility,
    private dataSource: DataSource
  ) {}

  getAssessmentColumnAliases = (): ObjectLiteral => {
    return {
      assessmentId: 'a.assessmentId',
      assessmentTitle: 'a.assessmentTitle',
      status: 'a.status',
      addedDate: 'a.addedDate',
      modifiedDate: 'a.modifiedDate',
      addedBy: 'a.addedBy',
      updatedBy: 'a.updatedBy',
      isDeleted: 'a.isDeleted',
    };
  };

  async findAllAssessments(params): Promise<IAssessmentList> {
    let paging: ISettingsParams;
    let data: IAssessmentDetail[];
    const queryObj = this.assessmentRepository.createQueryBuilder('a');

    queryObj.where({ isDeleted: 0 });
    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['a.assessmentTitle'];
    }
    const aliasList = this.getAssessmentColumnAliases();
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
          'a.assessmentId as assessmentId',
          'a.assessmentTitle as assessmentTitle',
          'a.status as status',
          'getMilliseconds(a.addedDate) as addedDate',
          'getMilliseconds(a.modifiedDate) as modifiedDate',
          'a.addedBy as addedBy',
          'a.updatedBy as updatedBy',
          'a.isDeleted as isDeleted',
        ])
        .execute();
    }

    const queryResult = {
      paging,
      data,
    };
    return queryResult;
  }

  async assessmentDetail(
    assessmentId: number,
    otherCondition?: string
  ): Promise<IAssessmentDetail> {
    const details = this.assessmentRepository
      .createQueryBuilder('a')
      .select([
        'a.assessmentId as assessmentId',
        'a.assessmentTitle as assessmentTitle',
        'a.status as status',
        'getMilliseconds(a.addedDate) as addedDate',
        'getMilliseconds(a.modifiedDate) as modifiedDate',
        'a.addedBy as addedBy',
        'a.updatedBy as updatedBy',
        'a.isDeleted as isDeleted',
      ])
      .where(`a.assessmentId = :assessmentId`, { assessmentId });

    if (otherCondition) {
      details.andWhere(otherCondition);
    }
    const assessmentDetail = await details.getRawOne();

    if (assessmentDetail) {
      const questions = await this.assessmentQuestionRepository
        .createQueryBuilder('aq')
        .select([
          'aq.question as question',
          'aq.questionType as questionType',
          'aq.correctAnswer as correctAnswer',
          'aq.assessmentQuestionId as assessmentQuestionId',
        ])
        .where('aq.assessmentId = :assessmentId', { assessmentId })
        .execute();

      console.log(questions);

      if (questions && questions.length > 0) {
        const options = await this.assessmentQuestionOptionRepository
          .createQueryBuilder('aqo')
          .select([
            'aqo.optionId as optionId',
            'aqo.optionData as optionData',
            'aqo.assessmentQuestionId as assessmentQuestionId',
          ])
          .where(`aqo.assessmentId = :assessmentId`, { assessmentId })
          .execute();

        questions.forEach((question) => {
          question.options = options.filter(
            (option) =>
              option.assessmentQuestionId === question.assessmentQuestionId
          );
        });

        assessmentDetail.questions = questions;
      }
    }

    return assessmentDetail;
  }

  async createAssessment(assessmentData: Assessment): Promise<InsertResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newAssessment = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Assessment)
        .values(assessmentData)
        .execute();
      const assessmentId = newAssessment.identifiers[0].assessmentId;
      if (assessmentData.questions && assessmentData.questions.length > 0) {
        const assessmentQuestionData = assessmentData.questions.map(
          (question) => ({
            ...question,
            assessmentId: assessmentId,
          })
        );
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(AssessmentQuestion)
          .values(assessmentQuestionData)
          .execute();

        const assessmentQuestions = await queryRunner.manager
          .createQueryBuilder()
          .select('aq.assessmentQuestionId')
          .from(AssessmentQuestion, 'aq')
          .where('aq.assessmentId = :assessmentId', { assessmentId })
          .orderBy('aq.assessmentQuestionId', 'ASC')
          .getMany();

        const assessmentOptionData = [];

        assessmentQuestions.forEach((assessmentQuestion, index) => {
          const question = assessmentData.questions[index];
          if (question.options && question.options.length > 0) {
            const options = question.options.map((option) => ({
              optionData: option.optionData,
              assessmentQuestionId: assessmentQuestion.assessmentQuestionId,
              assessmentId: assessmentId,
            }));
            assessmentOptionData.push(...options);
          }
        });
        if (assessmentOptionData.length > 0) {
          await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(AssessmentQuestionOption)
            .values(assessmentOptionData)
            .execute();
        }
      }

      await queryRunner.commitTransaction();
      return newAssessment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateAssessment(
    assessmentData: Assessment,
    assessmentId: number
  ): Promise<UpdateResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { questions, ...updateData } = assessmentData;

      // Update the assessment data
      const updateAssessment = await queryRunner.manager
        .createQueryBuilder()
        .update(Assessment)
        .set(updateData)
        .where('assessmentId = :assessmentId', { assessmentId })
        .execute();

      // Check if the update was successful
      if (updateAssessment.affected === 0) {
        throw new Error(`No assessment found with id ${assessmentId}`);
      }

      // If there are questions, update them
      if (questions && questions.length > 0) {
        // Delete existing questions and options for this assessment
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(AssessmentQuestion)
          .where('assessmentId = :assessmentId', { assessmentId })
          .execute();

        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(AssessmentQuestionOption)
          .where('assessmentId = :assessmentId', { assessmentId })
          .execute();

        // Insert the new questions
        const assessmentQuestionData = questions.map((question) => ({
          ...question,
          assessmentId: assessmentId,
        }));

        const insertQuestions = await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(AssessmentQuestion)
          .values(assessmentQuestionData)
          .execute();

        if (insertQuestions.identifiers.length === 0) {
          throw new Error(
            `Failed to insert assessment questions for id ${assessmentId}`
          );
        }

        // Retrieve the inserted question IDs
        const assessmentQuestions = await queryRunner.manager
          .createQueryBuilder()
          .select('aq.assessmentQuestionId')
          .from(AssessmentQuestion, 'aq')
          .where('aq.assessmentId = :assessmentId', { assessmentId })
          .orderBy('aq.assessmentQuestionId', 'ASC')
          .getMany();

        const questionOptionData = [];

        assessmentQuestions.forEach((assessmentQuestion, index) => {
          const question = assessmentData.questions[index];
          if (question.options && question.options.length > 0) {
            const options = question.options.map((option) => ({
              optionData: option.optionData,
              assessmentQuestionId: assessmentQuestion.assessmentQuestionId,
              assessmentId: assessmentId,
            }));
            questionOptionData.push(...options);
          }
        });

        // Insert the new options
        if (questionOptionData.length > 0) {
          await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(AssessmentQuestionOption)
            .values(questionOptionData)
            .execute();
        }
      }

      // Commit the transaction
      await queryRunner.commitTransaction();
      return updateAssessment;
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      console.error('Error updating assessment:', error.message);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async deleteAssessment(assessmentId: number): Promise<UpdateResult> {
    await this.assessmentRepository.update({ assessmentId }, { isDeleted: 1 });
    await this.assessmentQuestionRepository.update(
      { assessmentId: assessmentId },
      {
        isDeleted: 1,
      }
    );
    return await this.assessmentQuestionOptionRepository.update(
      { assessmentId: assessmentId },
      {
        isDeleted: 1,
      }
    );
  }

  assessmentAutocomplete(
    condition?: AutocompleteDto
  ): Promise<IAssessmentAutoComplete[]> {
    const queryBuilder = this.assessmentRepository
      .createQueryBuilder('a')
      .select([
        'a.assessmentId as assessmentId',
        'a.assessmentTitle as assessmentTitle',
      ]);

    if (condition) {
      if (condition.keyword) {
        queryBuilder.andWhere('a.assessmentTitle LIKE :keyword', {
          keyword: `%${condition.keyword}%`,
        });
      }

      if (condition.type) {
        queryBuilder.andWhere('a.status = :status', {
          status: condition.type,
        });
      }
      return queryBuilder.getRawMany();
    }
  }

  changeAssessmentStatus(ids: number[], status: string): Promise<UpdateResult> {
    return this.assessmentRepository
      .createQueryBuilder()
      .update(Assessment)
      .set({ status: Status[status] })
      .where(`assessmentId IN (:...ids)`, { ids })
      .execute();
  }
}
