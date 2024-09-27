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
import { Survey } from './entities/survey.entity';
import { SurveyQuestion } from './entities/survey-question.entity';
import { SurveyQuestionOption } from './entities/survey-qs-options.entity';
import { ListUtility } from '@app/utilities/list.utility';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';
import { AutocompleteDto, Status } from '@app/common-config/dto/common.dto';
import {
  ISurveyList,
  ISurveyDetail,
  ISurveyAutoComplete,
} from '../../interfaces/survey.interface';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
    @InjectRepository(SurveyQuestion)
    private surveyQuestionRepository: Repository<SurveyQuestion>,
    @InjectRepository(SurveyQuestionOption)
    private surveyQuestionOptionRepository: Repository<SurveyQuestionOption>,
    private listUtility: ListUtility,
    private dataSource: DataSource
  ) {}

  getSurveyColumnAliases = (): ObjectLiteral => {
    return {
      surveyId: 's.surveyId',
      surveyTitle: 's.surveyTitle',
      categoryId: 's.categoryId',
      status: 's.status',
      addedDate: 's.addedDate',
      modifiedDate: 's.modifiedDate',
      addedBy: 's.addedBy',
      updatedBy: 's.updatedBy',
      isDeleted: 's.isDeleted',
    };
  };

  async findAllSurveys(params): Promise<ISurveyList> {
    let paging: ISettingsParams;
    let data: ISurveyDetail[];
    const queryObj = this.surveyRepository.createQueryBuilder('s');

    queryObj.where({ isDeleted: 0 });
    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['s.surveyTitle'];
    }
    const aliasList = this.getSurveyColumnAliases();
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
          's.surveyId as surveyId',
          's.surveyTitle as surveyTitle',
          's.status as status',
          'getMilliseconds(s.addedDate) as addedDate',
          'getMilliseconds(s.modifiedDate) as modifiedDate',
          's.addedBy as addedBy',
          's.updatedBy as updatedBy',
          's.isDeleted as isDeleted',
        ])
        .execute();
    }

    const queryResult = {
      paging,
      data,
    };
    return queryResult;
  }

  async surveyDetail(
    surveyId: number,
    otherCondition?: string
  ): Promise<ISurveyDetail> {
    const details = this.surveyRepository
      .createQueryBuilder('s')
      .leftJoin(SurveyQuestion, 'sq', 's.surveyId = sq.surveyId')
      .leftJoin(SurveyQuestionOption, 'sqo', 's.surveyId = sqo.surveyId')
      .select([
        's.surveyId as surveyId',
        's.surveyTitle as surveyTitle',
        's.status as status',
        'getMilliseconds(s.addedDate) as addedDate',
        'getMilliseconds(s.modifiedDate) as modifiedDate',
        's.addedBy as addedBy',
        's.updatedBy as updatedBy',
        's.isDeleted as isDeleted',
      ])
      .where(`s.surveyId = :surveyId`, { surveyId });

    if (otherCondition) {
      details.andWhere(otherCondition);
    }

    const surveyDetails = await details.getRawOne();

    if (surveyDetails) {
      const surveyQuestions = await this.surveyQuestionRepository
        .createQueryBuilder('sq')
        .select([
          'sq.surveyQuestionId as surveyQuestionId',
          'sq.question as question',
          'sq.questionType as questionType',
        ])
        .where(`sq.surveyId = :surveyId`, { surveyId })
        .execute();
      if (surveyQuestions) {
        const surveyQuestionOptions = await this.surveyQuestionOptionRepository
          .createQueryBuilder('sqo')
          .select([
            'sqo.surveyQuestionId as surveyQuestionId',
            'sqo.optionData as optionData',
            'sqo.optionId as optionId',
          ])
          .where(`sqo.surveyId = :surveyId`, { surveyId })
          .execute();

        if (surveyQuestions && surveyQuestions.length > 0) {
          surveyQuestions.forEach((sq: any) => {
            sq.options = surveyQuestionOptions.filter(
              (el: any) => el.surveyQuestionId === sq.surveyQuestionId
            );
          });
        }
        console.log('surveyQuestionOptions--->', surveyQuestions);
        surveyDetails.questions = surveyQuestions;
      }

      return surveyDetails;
    }
  }

  async createSurvey(surveyData: Survey): Promise<InsertResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newSurvey = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Survey)
        .values(surveyData)
        .execute();

      const surveyId = newSurvey.identifiers[0].surveyId;

      if (surveyData.questions && surveyData.questions.length > 0) {
        const surveyQuestionData = surveyData.questions.map((question) => ({
          ...question,
          surveyId: surveyId,
        }));
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(SurveyQuestion)
          .values(surveyQuestionData)
          .execute();

        const surveyQuestions = await queryRunner.manager
          .createQueryBuilder()
          .select('sq.surveyQuestionId')
          .from(SurveyQuestion, 'sq')
          .where('sq.surveyId = :surveyId', { surveyId })
          .orderBy('sq.surveyQuestionId', 'ASC')
          .getMany();

        const questionOptionData = [];

        surveyQuestions.forEach((surveyQuestion, index) => {
          const question = surveyData.questions[index];
          if (question.options && question.options.length > 0) {
            const options = question.options.map((option) => ({
              optionData: option.optionData,
              surveyQuestionId: surveyQuestion.surveyQuestionId,
              surveyId: surveyId,
            }));
            questionOptionData.push(...options);
          }
        });

        if (questionOptionData.length > 0) {
          await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(SurveyQuestionOption)
            .values(questionOptionData)
            .execute();
        }
      }

      await queryRunner.commitTransaction();
      return newSurvey;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateSurvey(
    surveyData: Survey,
    surveyId: number
  ): Promise<UpdateResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { questions, ...updateData } = surveyData;

      const updateSurvey = await queryRunner.manager
        .createQueryBuilder()
        .update(Survey)
        .set(updateData)
        .where({ surveyId })
        .execute();

      if (questions && questions.length > 0) {
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(SurveyQuestion)
          .where('surveyId = :surveyId', { surveyId })
          .execute();

        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(SurveyQuestionOption)
          .where('surveyId = :surveyId', { surveyId })
          .execute();

        const surveyQuestionData = surveyData.questions.map((question) => ({
          ...question,
          surveyId: surveyId,
        }));
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(SurveyQuestion)
          .values(surveyQuestionData)
          .execute();

        const surveyQuestions = await queryRunner.manager
          .createQueryBuilder()
          .select('sq.surveyQuestionId')
          .from(SurveyQuestion, 'sq')
          .where('sq.surveyId = :surveyId', { surveyId })
          .orderBy('sq.surveyQuestionId', 'ASC')
          .getMany();

        const questionOptionData = [];

        surveyQuestions.forEach((surveyQuestion, index) => {
          const question = surveyData.questions[index];
          if (question.options && question.options.length > 0) {
            const options = question.options.map((option) => ({
              optionData: option.optionData,
              surveyQuestionId: surveyQuestion.surveyQuestionId,
              surveyId: surveyId,
            }));
            questionOptionData.push(...options);
          }
        });

        if (questionOptionData.length > 0) {
          await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(SurveyQuestionOption)
            .values(questionOptionData)
            .execute();
        }
      }

      await queryRunner.commitTransaction();
      return updateSurvey;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteSurvey(surveyId: number): Promise<UpdateResult> {
    await this.surveyRepository.update({ surveyId }, { isDeleted: 1 });
    await this.surveyQuestionRepository.update(
      { surveyId: surveyId },
      {
        isDeleted: 1,
      }
    );
    return await this.surveyQuestionOptionRepository.update(
      { surveyId: surveyId },
      {
        isDeleted: 1,
      }
    );
  }

  surveyAutocomplete(
    condition?: AutocompleteDto
  ): Promise<ISurveyAutoComplete[]> {
    const queryBuilder = this.surveyRepository
      .createQueryBuilder('s')
      .select(['s.surveyId as surveyId', 's.surveyTitle as surveyTitle']);

    if (condition) {
      if (condition.keyword) {
        queryBuilder.andWhere('s.surveyTitle LIKE :keyword', {
          keyword: `%${condition.keyword}%`,
        });
      }

      if (condition.type) {
        queryBuilder.andWhere('s.status = :status', {
          status: condition.type,
        });
      }
      return queryBuilder.getRawMany();
    }
  }

  changeSurveyStatus(ids: number[], status: string): Promise<UpdateResult> {
    return this.surveyRepository
      .createQueryBuilder()
      .update(Survey)
      .set({ status: Status[status] })
      .where(`surveyId IN (:...ids)`, { ids })
      .execute();
  }
}
