import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, ObjectLiteral, Repository, UpdateResult } from 'typeorm';
import _ from 'underscore';
import { AutocompleteDto, Status } from '@app/common-config/dto/common.dto';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';
import {
  INotificationTemplateAutoComplete,
  INotificationTemplateDetail,
  INotificationTemplateList,
  INotificationTemplateRecord,
} from '../../interfaces/notification-template.interface';
import { ListUtility } from '@app/utilities/list.utility';
import { NotificationTemplate } from './entities/notification-template.entity';

@Injectable()
export class NotificationTemplatesService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private notificationTemplateRepository: Repository<NotificationTemplate>,
    private listUtility: ListUtility
  ) {}

  notificationTemplateColumnAliases = (): ObjectLiteral => {
    return {
      notificationTemplateId: 'nt.notificationTemplateId',
      templateName: 'nt.templateName',
      subject: 'nt.subject',
      senderEmail: 'nt.senderEmail',
      senderName: 'nt.senderName',
      content: 'nt.content',
      categoryId: 'nt.categoryId',
      addedDate: 'nt.addedDate',
      modifiedDate: 'nt.modifiedDate',
    };
  };

  async findAllNotificationTemplates(
    params
  ): Promise<INotificationTemplateList> {
    let paging: ISettingsParams;
    let data: INotificationTemplateDetail[];
    const queryObj =
      this.notificationTemplateRepository.createQueryBuilder('nt');
    queryObj.where({ isDeleted: 0 });
    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['nt.templateName', 'nt.subject'];
    }
    const aliasList = this.notificationTemplateColumnAliases();
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
          'nt.notificationTemplateId as notificationTemplateId',
          'nt.templateName as templateName',
          'nt.subject as subject',
          'nt.senderEmail as senderEmail',
          'nt.senderName as senderName',
          'nt.content as content',
          'nt.categoryId as categoryId',
          'getMilliseconds(nt.addedDate) as addedDate',
          'getMilliseconds(nt.modifiedDate) as modifiedDate',
        ])
        .execute();
    }

    const queryResult = {
      paging,
      data,
    };
    return queryResult;
  }

  notificationTemplateDetail(
    notificationTemplateId: number,
    otherCondition?: string
  ): Promise<INotificationTemplateDetail> {
    const details = this.notificationTemplateRepository
      .createQueryBuilder('nt')
      .select([
        'nt.notificationTemplateId as notificationTemplateId',
        'nt.templateName as templateName',
        'nt.subject as subject',
        'nt.senderEmail as senderEmail',
        'nt.senderName as senderName',
        'nt.content as content',
        'nt.categoryId as categoryId',
        'getMilliseconds(nt.addedDate) as addedDate',
        'getMilliseconds(nt.modifiedDate) as modifiedDate',
      ])
      .where(`nt.notificationTemplateId = :notificationTemplateId`, {
        notificationTemplateId,
      });

    if (otherCondition) {
      details.andWhere(otherCondition);
    }
    return details.getRawOne();
  }

  getTemplateNameForAdd(
    templateName: string
  ): Promise<INotificationTemplateRecord> {
    return this.notificationTemplateRepository
      .createQueryBuilder('nt')
      .select('nt.notificationTemplateId as notificationTemplateId')
      .where({ templateName: templateName })
      .getRawOne();
  }

  createNotificationTemplate(
    notificationTemplateData: NotificationTemplate
  ): Promise<InsertResult> {
    const newNotificationTemplate = this.notificationTemplateRepository
      .createQueryBuilder()
      .insert()
      .into(NotificationTemplate)
      .values(notificationTemplateData)
      .execute();
    return newNotificationTemplate;
  }

  getTemplateNameForUpdate(
    templateName: string,
    id: number
  ): Promise<ObjectLiteral> {
    const queryBuilder = this.notificationTemplateRepository
      .createQueryBuilder('nt')
      .select(['nt.notificationTemplateId as notificationTemplateId']);
    if (templateName) {
      queryBuilder.andWhere('nt.templateName = :templateName', {
        templateName,
      });
    }
    if (id) {
      queryBuilder.andWhere('nt.notificationTemplateId != :id', { id });
    }
    const data = queryBuilder.getRawOne();
    return data;
  }

  updateNotificationTemplate(
    notificationTemplateData: NotificationTemplate,
    notificationTemplateId: number
  ): Promise<UpdateResult> {
    return this.notificationTemplateRepository
      .createQueryBuilder()
      .update(NotificationTemplate)
      .set(notificationTemplateData)
      .where({ notificationTemplateId })
      .execute();
  }

  deleteNotificationTemplate(id: number): Promise<UpdateResult> {
    return this.notificationTemplateRepository.update(
      { notificationTemplateId: id },
      { isDeleted: 1 }
    );
  }

  notificationTemplateAutocomplete(
    condition?: AutocompleteDto
  ): Promise<INotificationTemplateAutoComplete[]> {
    const queryBuilder = this.notificationTemplateRepository
      .createQueryBuilder('nt')
      .select([
        'nt.notificationTemplateId as notificationTemplateId',
        'nt.templateName as templateName',
      ]);

    if (condition) {
      if (condition.keyword) {
        queryBuilder.andWhere('nt.templateName LIKE :keyword', {
          keyword: `%${condition.keyword}%`,
        });
      }

      if (condition.type) {
        queryBuilder.andWhere('nt.status = :status', {
          status: condition.type,
        });
      }
      return queryBuilder.getRawMany();
    }
  }

  notificationTemplateChangeStatus(
    ids: number[],
    status: string
  ): Promise<UpdateResult> {
    return this.notificationTemplateRepository
      .createQueryBuilder()
      .update(NotificationTemplate)
      .set({ status: Status[status] })
      .where(`notificationTemplateId IN (:...ids)`, { ids })
      .execute();
  }
}
