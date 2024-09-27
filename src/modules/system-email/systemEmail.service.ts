import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  InsertResult,
  Not,
  ObjectLiteral,
  Repository,
  UpdateResult,
} from 'typeorm';
import _ from 'underscore';
import { SystemEmail } from './entities/systemEmail.entity';
import { AutocompleteDto, Status } from '@app/common-config/dto/common.dto';
import { ListUtility } from '@app/utilities/list.utility';
import { ISettingsParams } from '@app/common-config/interfaces/common-interface';
import {
  ISystemEmailAutoComplete,
  ISystemEmailDetail,
  ISystemEmailList,
} from '../../interfaces/systemEmail.interface';

@Injectable()
export class SystemEmailService {
  constructor(
    @InjectRepository(SystemEmail)
    private systemEmailRepositry: Repository<SystemEmail>,
    private listUtility: ListUtility
  ) {}

  getColumnAliases = (): ObjectLiteral => {
    return {
      emailTemplateId: 'mse.emailTemplateId',
      emailCode: 'mse.emailCode',
      emailTitle: 'mse.emailTitle',
      fromName: 'mse.fromName',
      status: 'mse.status',
    };
  };

  async allEmailTemplate(params): Promise<ISystemEmailList> {
    let paging: ISettingsParams;
    let data: ISystemEmailDetail[];
    const queryObj = this.systemEmailRepositry.createQueryBuilder('mse');

    if (!_.isEmpty(params.keyword)) {
      params.keywordColumns = ['mse.emailTitle'];
    }
    const aliasList = this.getColumnAliases();
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
          'mse.emailTemplateId as emailTemplateId',
          'mse.emailCode as emailCode',
          'mse.emailTitle as emailTitle',
          'mse.emailSubject as emailSubject',
          'mse.fromName as fromName',
        ])
        .execute();
    }

    const queryResult = {
      paging,
      data,
    };
    return queryResult;
  }

  SystemEmailDetail(
    value: number,
    columnName: string,
    otherCondition?: string
  ): Promise<ISystemEmailDetail> {
    const details = this.systemEmailRepositry
      .createQueryBuilder('mse')
      .select([
        'mse.emailTemplateId as emailTemplateId',
        'mse.emailCode as emailCode',
        'mse.emailTitle as emailTitle',
        'mse.fromName as fromName',
        'mse.fromEmail as fromEmail',
        'mse.replyToName as replyToName',
        'mse.replyToEmail as replyToEmail',
        'mse.ccEmail as ccEmail',
        'mse.bccEmail as bccEmail',
        'mse.emailMessage  as emailMessage',
        'mse.emailSubject as emailSubject',
        'mse.variables as variables',
      ])
      .where(`mse.${columnName} = :value`, { value });

    if (otherCondition) {
      details.andWhere(otherCondition);
    }
    const emailTemplates = details.getRawOne();
    return emailTemplates;
    // if (emailTemplates) {
    //   return {
    //     ...emailTemplates,
    //     variables: JSON.parse(emailTemplates.variables),
    //   };
    // }
    // return false;
  }

  getSystemEmailCodeForAdd(emailCode: string): Promise<ObjectLiteral> {
    return this.systemEmailRepositry.findOne({
      select: ['emailTemplateId'],
      where: { emailCode: emailCode },
    });
  }

  createSystemEmail(systemEmailData: SystemEmail): Promise<InsertResult> {
    const newSystemEmail = this.systemEmailRepositry
      .createQueryBuilder()
      .insert()
      .into(SystemEmail)
      .values(systemEmailData)
      .execute();
    return newSystemEmail;
  }

  checkSystemEmailExists(emailTemplateId: number): Promise<ObjectLiteral> {
    return this.systemEmailRepositry.findOne({
      select: {
        emailTemplateId: true,
      },
      where: {
        emailTemplateId: emailTemplateId,
      },
    });
  }

  getSystemEmailCodeForUpdate(
    emailCode: string,
    id: number
  ): Promise<ObjectLiteral | null> {
    return this.systemEmailRepositry.findOne({
      select: {
        emailTemplateId: true,
      },
      where: {
        emailCode: emailCode,
        emailTemplateId: Not(id),
      },
    });
  }

  updateSystemEmail(
    userData: SystemEmail,
    columnName: string,
    value: any
  ): Promise<UpdateResult> {
    return this.systemEmailRepositry
      .createQueryBuilder()
      .update(SystemEmail)
      .set(userData)
      .where(`${columnName} = :value`, { value })
      .execute();
  }

  deleteSystemEmail(id): Promise<DeleteResult> {
    return this.systemEmailRepositry.delete(id);
  }

  systemEmailAutocomplete(
    condition?: string
  ): Promise<ISystemEmailAutoComplete[]> {
    let result = this.systemEmailRepositry
      .createQueryBuilder('mse')
      .select([
        'mse.emailTemplateId as emailTemplateId',
        'mse.emailTitle as emailTitle',
      ]);

    if (condition) {
      result = result.where(condition);
    }
    return result.getRawMany();
  }

  systemEmailAutocomplete1(
    condition?: AutocompleteDto
  ): Promise<ISystemEmailAutoComplete[]> {
    const queryBuilder = this.systemEmailRepositry
      .createQueryBuilder('mse')
      .select([
        'mse.iEmailTemplateId as emailTemplateId',
        'mse.vEmailTitle as emailTitle',
      ]);

    if (condition) {
      if (condition.keyword) {
        queryBuilder.andWhere('mse.vEmailTitle LIKE :keyword', {
          keyword: `%${condition.keyword}%`,
        });
      }

      if (condition.type) {
        queryBuilder.andWhere('mse.eStatus = :status', {
          status: condition.type,
        });
      }
    }

    return queryBuilder.getRawMany();
  }

  systemEmailChangeStatus(
    ids: number[],
    status: string
  ): Promise<UpdateResult> {
    return this.systemEmailRepositry
      .createQueryBuilder()
      .update(SystemEmail)
      .set({ status: () => `'${Status[status]}'` })
      .where(`emailTemplateId IN (${ids.join(',')})`)
      .execute();
  }
}
