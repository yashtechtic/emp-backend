import { Injectable } from '@nestjs/common';
import { Company } from './entities/company.entity';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { CompanyScriptService } from './company-script.service';
import { CompanySetting } from './entities/company-setting.entity';
import { CompanySubscription } from './entities/company-subscription.entity';
import { Country } from '../country/entities/country.entity';
import { State } from '../state/entities/state.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @InjectRepository(CompanySetting)
    private companySettingRepository: Repository<CompanySetting>,
    private companyScriptService: CompanyScriptService
  ) {}

  async createCompany(
    createCompanyDto: CreateCompanyDto
  ): Promise<InsertResult> {
    const createDataBase =
      this.companyScriptService.companyDatabase(createCompanyDto);
    return createDataBase;
  }

  async getCompanySettingList() {
    return await this.companySettingRepository
      .createQueryBuilder('cs')
      .select([
        'cs.companySettingId as companySettingId',
        'cs.companyId as companyId',
        'cs.domain as domain',
        'cs.connectionUrl as connectionUrl',
        'cs.email as email',
        'cs.companyName as companyName',
        'cs.status as status',
        'cs.isDeleted as isDeleted',
      ])
      .execute();
  }

  async companyDataFormat(companyData: any) {
    let companyDataFormat;
    if (Array.isArray(companyData) && companyData.length) {
      companyDataFormat = companyData.map((company: any) => {
        return {
          companyId: company.iCompanyId,
          companyName: company.vCompanyName,
          companyEmail: company.vCompanyEmail,
          companyPrefix: company.vCompanyPrefix,
          status: company.eStatus,
          addedDate: company.dtAddedDate,
          modifiedDate: company.dtModifiedDate,
          document: company.vDocument,
          documentExpiryDate: company.dtDocumentExpiryDate,
          isDeleted: company.iIsDeleted,
        };
      });
    }
    return companyDataFormat;
  }

  async getCompanyDetails(companyId: number): Promise<any> {
    const companyData = await this.companyRepository
      .createQueryBuilder('cs')
      .leftJoin(Country, 'c', 'c.countryId = cs.countryId')
      .leftJoin(State, 's', 's.stateId = cs.stateId')
      .select([
        'cs.companyName as companyName',
        'cs.companyEmail as companyEmail',
        'cs.address as address',
        'cs.city as city',
        's.state as state',
        'cs.stateId as stateId',
        'c.country as country',
        'cs.countryId as countryId',
        'cs.logo as logo',
        'cs.logo as logoUrl',
      ])
      .where('cs.companyId = :companyId', { companyId: companyId })
      .getRawOne();

    const recentExpiredSubscription = await this.companyRepository
      .createQueryBuilder('cs')
      .leftJoin(
        CompanySubscription,
        'ss',
        'ss.companySubscriptionId = cs.companyId'
      )
      .select(['ss.planName as planName'])
      .where('cs.companyId = :companyId', { companyId: companyId })
      .andWhere('ss.subscriptionExpiryDate < :now', { now: new Date() })
      .andWhere('ss.subscriptionStatus = :status', { status: 'Expired' })
      .orderBy('ss.subscriptionExpiryDate', 'DESC')
      .getRawOne();

    const subscriptionData = await this.companyRepository
      .createQueryBuilder('cs')
      .leftJoin(
        CompanySubscription,
        'ss',
        'ss.companySubscriptionId = cs.companyId'
      )
      .select([
        'ss.numberOfUsers as licensesAvailable',
        'ss.numberOfUsersInUse as licensesInUse',
        'ss.subscriptionExpiryDate as subscriptionExpiryDate',
        'ss.planName as currentSubscription',
        'ss.subscriptionStatus as subscriptionStatus',
      ])
      .where('cs.companyId = :companyId', { companyId: companyId })
      .getRawMany();

    // Merge the subscription data into the company data
    if (subscriptionData) {
      companyData.subscription = subscriptionData;
    }
    companyData.recentExpiredSubscription = null;
    if (recentExpiredSubscription) {
      companyData.recentExpiredSubscription =
        recentExpiredSubscription.planName;
    }

    return companyData;
  }

  updateCompanyDetails(
    companyId: number,
    body: UpdateCompanyDto
  ): Promise<any> {
    return this.companyRepository
      .createQueryBuilder()
      .update(Company)
      .set(body)
      .where('companyId = :companyId', { companyId: companyId })
      .execute();
  }
}
