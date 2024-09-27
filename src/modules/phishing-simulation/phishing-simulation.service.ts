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
import { AutocompleteDto } from '@app/common-config/dto/common.dto';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';

import { ListUtility } from '@app/utilities/list.utility';
import { LandingPage } from '../landing-pages/entities/landing-page.entity';
import { Domain } from '../domains/entities/domain.entity';
import { MyCategory } from '../my-categories/entities/my-category.entity';
import { PhishingSimulation } from './entities/phishing-simulation.entity';
import { PhishingGroupDept } from './entities/phishing-group-dept.entity';
import {
  IPhishingSimulationDetail,
  IPhishingSimulationList,
  IPhishingSimulationRecord,
} from '@app/interfaces/phishing-simulation.interface';

@Injectable()
export class PhisingSimulationService {
  constructor(
    @InjectRepository(PhishingSimulation)
    private phishingSimulationRepository: Repository<PhishingSimulation>,
    @InjectRepository(PhishingGroupDept)
    private phishingGroupDeptRepository: Repository<PhishingGroupDept>,
    private listUtility: ListUtility,
    private dataSource: DataSource
  ) {}

  phishingSimulationColumnAliases = (): ObjectLiteral => {
    return {
      programName: 'ps.vProgramName',
      sendTo: 'ps.vSendTo',
      selectType: 'ps.vSelectType',
      frequency: 'ps.vFrequency',
      startDate: 'ps.dtStartDate',
      startTime: 'ps.tStartTime',
      timeZoneId: 'ps.iTimeZoneId',
      isSendEmail: 'ps.iIsSendEmail',
      emailOver: 'ps.iEmailOver',
      emailOverType: 'ps.vEmailOverType',
      dayStartTime: 'ps.vDayStartTime',
      dayEndTime: 'ps.vDayEndTime',
      businessDays: 'ps.jBusinessDays',
      categoryId: 'ps.iCategoryId',
      difficultyRating: 'ps.vDifficultyRating',
      phishingTemplateId: 'ps.iPhishingTemplateId',
      domainId: 'ps.iDomainId',
      landingPageId: 'ps.iLandingPageId',
      isSendEmailReport: 'ps.iIsSendEmailReport',
      isHideEmailReport: 'ps.iIsHideEmailReport',
      trackPhishingReply: 'ps.iTrackPhishingReply',
      addedDate: 'ps.dtAddedDate',
      modifiedDate: 'ps.dtModifiedDate',
      addedBy: 'ps.iAddedBy',
      isDeleted: 'ps.iIsDeleted',
    };
  };

  async findAllPhishingSimulation(params): Promise<IPhishingSimulationList> {
    let paging: ISettingsParams;
    let data: IPhishingSimulationDetail[];
    const queryObj = this.phishingSimulationRepository
      .createQueryBuilder('ps')
      .leftJoin(LandingPage, 'lp', 'lp.landingPageId = ps.landingPageId')
      .leftJoin(Domain, 'd', 'd.domainId = ps.domainId')
      .leftJoin(MyCategory, 'c', 'c.myCategoryId = ps.categoryId');
    queryObj.where({ isDeleted: 0 });

    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['ps.programName'];
    }
    const aliasList = this.phishingSimulationColumnAliases();
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
          'ps.phishingSimulationId as phishingSimulationId',
          'ps.programName as programName',
          'ps.isSendEmailReport as isSendEmailReport',
          'ps.isHideEmailReport as isHideEmailReport',
          'ps.trackPhishingReply as trackPhishingReply',
          'getMilliseconds(ps.addedDate) as addedDate',
          'getMilliseconds(ps.modifiedDate) as modifiedDate',
          'ps.addedBy as addedBy',
          'ps.isDeleted as isDeleted',
        ])
        .execute();
    }

    const queryResult = {
      paging,
      data,
    };
    return queryResult;
  }

  phishingSimulationDetail(
    phishingSimulationId: number,
    otherCondition?: string
  ): Promise<IPhishingSimulationDetail> {
    const details = this.phishingSimulationRepository
      .createQueryBuilder('ps')
      .leftJoin(LandingPage, 'lp', 'lp.landingPageId = ps.landingPageId')
      .leftJoin(Domain, 'd', 'd.domainId = ps.domainId')
      .leftJoin(MyCategory, 'c', 'c.myCategoryId = ps.categoryId')
      .select([
        'ps.phishingSimulationId as phishingSimulationId',
        'ps.programName as programName',
        'ps.sendTo as sendTo',
        'ps.selectType as selectType',
        'ps.frequency as frequency',
        'ps.startDate as startDate',
        'ps.startTime as startTime',
        'ps.timeZoneId as timeZoneId',
        'ps.isSendEmail as isSendEmail',
        'ps.emailOver as emailOver',
        'ps.emailOverType as emailOverType',
        'ps.dayStartTime as dayStartTime',
        'ps.dayEndTime as dayEndTime',
        'ps.businessDays as businessDays',
        'ps.categoryId as categoryId',
        'ps.difficultyRating as difficultyRating',
        'ps.phishingSimulationId as phishingSimulationId',
        'ps.domainId as domainId',
        'ps.landingPageId as landingPageId',
        'ps.isSendEmailReport as isSendEmailReport',
        'ps.isHideEmailReport as isHideEmailReport',
        'ps.trackPhishingReply as trackPhishingReply',
        'getMilliseconds(ps.addedDate) as addedDate',
        'getMilliseconds(ps.modifiedDate) as modifiedDate',
        'ps.addedBy as addedBy',
        'ps.isDeleted as isDeleted',
      ])
      .where(`ps.phishingSimulationId = :phishingSimulationId`, {
        phishingSimulationId,
      });

    if (otherCondition) {
      details.andWhere(otherCondition);
    }
    return details.getRawOne();
  }

  getProgramNameForAdd(
    programName: string
  ): Promise<IPhishingSimulationRecord> {
    return this.phishingSimulationRepository
      .createQueryBuilder('ps')
      .select('ps.phishingSimulationId as phishingSimulationId')
      .where({ programName: programName })
      .getRawOne();
  }

  async createPhishingSimulation(
    phishingSimulationData: PhishingSimulation
  ): Promise<InsertResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newPhishingSimulation = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(PhishingSimulation)
        .values(phishingSimulationData)
        .execute();

      if (
        phishingSimulationData.groupDeptIds &&
        phishingSimulationData.groupDeptIds.length > 0
      ) {
        const phishingGroupDeptData = [];
        phishingSimulationData.groupDeptIds.forEach((el) => {
          phishingGroupDeptData.push({
            selectedId: el,
            selectedType: phishingSimulationData.selectType,
            phishingSimulationId:
              newPhishingSimulation.identifiers[0].phishingSimulationId,
          });
        });
        console.log(phishingGroupDeptData);

        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(PhishingGroupDept)
          .values(phishingGroupDeptData)
          .execute();
      }

      await queryRunner.commitTransaction();
      return newPhishingSimulation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error; // Rethrow the error after rollback
    } finally {
      await queryRunner.release();
    }
  }

  getProgramNameForUpdate(
    programName: string,
    id: number
  ): Promise<ObjectLiteral> {
    const queryBuilder = this.phishingSimulationRepository
      .createQueryBuilder('ps')
      .select(['ps.phishingSimulationId as phishingSimulationId']);
    if (programName) {
      queryBuilder.andWhere('ps.programName = :programName', {
        programName,
      });
    }
    if (id) {
      queryBuilder.andWhere('ps.phishingSimulationId != :id', { id });
    }
    const data = queryBuilder.getRawOne();
    return data;
  }

  async updatePhishingSimulation(
    phishingSimulationData: PhishingSimulation,
    phishingSimulationId: number
  ): Promise<UpdateResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Exclude the groupUser property from the update operation
      const { groupDeptIds, ...updateData } = phishingSimulationData;

      const updatePhishingSimulation = await queryRunner.manager
        .createQueryBuilder()
        .update(PhishingSimulation)
        .set(updateData) // Use the updateData that excludes groupUser
        .where({ phishingSimulationId })
        .execute();

      if (groupDeptIds && groupDeptIds.length > 0) {
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(PhishingGroupDept)
          .where('phishingSimulationId = :phishingSimulationId', {
            phishingSimulationId: phishingSimulationId,
          })
          .execute();

        const phishingGroupDeptData = [];
        phishingSimulationData.groupDeptIds.forEach((el) => {
          phishingGroupDeptData.push({
            selectedId: el,
            selectedType: phishingSimulationData.selectType,
            phishingSimulationId,
          });
        });
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(PhishingGroupDept)
          .values(phishingGroupDeptData)
          .execute();
      }

      await queryRunner.commitTransaction();
      return updatePhishingSimulation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error; // Rethrow the error after rollback
    } finally {
      // Ensure you release the query runner in the finally block
      await queryRunner.release();
    }
  }

  deletePhishingSimulation(id: number): Promise<UpdateResult> {
    return this.phishingSimulationRepository
      .createQueryBuilder()
      .update(PhishingSimulation)
      .set({ isDeleted: 1 })
      .where('phishingSimulationId = :id', { id })
      .execute();
  }

  phishingSimulationAutocomplete(
    condition?: AutocompleteDto
  ): Promise<IPhishingSimulationRecord[]> {
    const queryBuilder = this.phishingSimulationRepository
      .createQueryBuilder('ps')
      .select([
        'ps.phishingSimulationId as phishingSimulationId',
        'ps.programName as programName',
      ]);

    if (condition) {
      if (condition.keyword) {
        queryBuilder.andWhere('ps.programName LIKE :keyword', {
          keyword: `%${condition.keyword}%`,
        });
      }

      if (condition.type) {
        queryBuilder.andWhere('ps.status = :status', {
          status: condition.type,
        });
      }
      return queryBuilder.getRawMany();
    }
  }

  //   phishingSimulationChangeStatus(
  //     ids: number[],
  //     status: string
  //   ): Promise<UpdateResult> {
  //     return this.phishingSimulationRepository
  //       .createQueryBuilder()
  //       .update(PhishingSimulation)
  //       .set({ status: Status[status] })
  //       .where(`phishingSimulationId IN (:...ids)`, { ids })
  //       .execute();
  //   }
}
