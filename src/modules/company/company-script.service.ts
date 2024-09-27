import { Injectable } from '@nestjs/common';
import { Company } from './entities/company.entity';
import { DataSource, InsertResult, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CreateCompanyDto } from './dto/company.dto';
import { CompanySubscription } from './entities/company-subscription.entity';
import { User } from '../users/entities/user.entity';
import { Roles } from '../company-roles/entities/company-role.entity';
import { GeneralUtility } from '@app/utilities/general.utility';
import { SettingsService } from '@app/services/services/settings.service';
import { addSeconds } from 'date-fns';
import { SubscriptionService } from '../subscription/subscription.service';
import { CompanySetting } from './entities/company-setting.entity';
import { ConfigService } from '@nestjs/config';
import { Group } from '../user-group/entity/group.entity';
import { GroupUser } from '../user-group/entity/user-group.entity';
import { Settings } from '../settings/entities/setting.entity';
import { randomUUID } from 'crypto';
import { RoleUser } from '../company-roles/entities/role-users.entity';
import { RoleMenu } from '../company-roles/entities/company-role-menu.entity';
import { RoleCategory } from '../company-roles/entities/company-role-category.entity';
import { DynamicForm } from '../dynamic-forms/entities/dynamic-form.entity';
import { FormField } from '../dynamic-forms/entities/form-field.entity';
import { FieldValue } from '../dynamic-forms/entities/field-value.entity';
import { CapabilityGroupsDepartments } from '../company-roles/entities/capability-groups-dept.entity';
import { Country } from '../country/entities/country.entity';
import { State } from '../state/entities/state.entity';
import { City } from '../city/entities/city.entity';
import { seedDatabase } from './seeds/seed-data';
import { GroupToRole } from '../user-group/entity/group-role-association.entity';
import { replicateData } from './replicate-data/replicate-data';
import { MyCategory } from '../my-categories/entities/my-category.entity';
import { Blog } from '../blogs/entities/blog.entity';
import { LandingPage } from '../landing-pages/entities/landing-page.entity';
import { Domain } from '../domains/entities/domain.entity';
import { Survey } from '../survey/entities/survey.entity';
import { SurveyQuestion } from '../survey/entities/survey-question.entity';
import { SurveyQuestionOption } from '../survey/entities/survey-qs-options.entity';
import { Assessment } from '../assessments/entities/assessment.entity';
import { AssessmentQuestion } from '../assessments/entities/assessment-question.entity';
import { AssessmentQuestionOption } from '../assessments/entities/assessment-qs-options.entity';
import { addGetMillisecondsFunction } from '@app/helpers/database.helper';

@Injectable()
export class CompanyScriptService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private generalUtility: GeneralUtility,
    private settings: SettingsService,
    private subscriptions: SubscriptionService,
    @InjectRepository(CompanySetting)
    private companySettingRepository: Repository<CompanySetting>,
    @InjectRepository(Settings)
    private settingRepository: Repository<Settings>,

    @InjectRepository(Country)
    private countryRepository: Repository<Country>,

    @InjectRepository(State)
    private stateRepository: Repository<State>,

    @InjectRepository(City)
    private cityRepository: Repository<City>,
    private configService: ConfigService
  ) {}

  async companyDatabase(companyData: CreateCompanyDto): Promise<InsertResult> {
    const companyPrefix = this.getCompanyPrefix(companyData.companyName);
    const companySettingData = await this.getCompanySetting(companyPrefix);

    if (companySettingData) {
      return {
        identifiers: [],
        generatedMaps: [],
        raw: { message: 'Company already exists' },
      };
    } else {
      const databaseName = companyPrefix;
      const subscriptionDetail = await this.subscriptions.subscriptionDetail(
        companyData.subscriptionId
      );
      const { host, port, username, password } = this.getConfigs();

      try {
        await this.createDatabase(databaseName);
        const connection = await this.initializeConnection(
          databaseName,
          host,
          port,
          username,
          password
        );

        await replicateData(
          connection,
          this.countryRepository,
          this.stateRepository,
          this.cityRepository,
          this.settingRepository
        ).catch(console.error);

        await seedDatabase(connection).catch(console.error);
        const expiryTime = await this.getExpiryTime();

        const userData = this.prepareUserData(companyData, expiryTime);
        const companySettingData = this.prepareCompanySettingData(
          companyData,
          username,
          password,
          host,
          port,
          databaseName
        );
        const subscriptionClone = this.prepareSubscriptionClone(
          companyData,
          subscriptionDetail
        );
        await addGetMillisecondsFunction(connection);
        return await this.performDatabaseOperations(
          connection,
          userData,
          companyData,
          companySettingData,
          subscriptionClone
          // settingData
        );
      } catch (err) {
        console.error('Error during Data Source initialization', err);
        throw err; // Rethrow the error to be handled by the caller
      }
    }
  }

  private getConfigs() {
    return {
      host: this.configService.get<string>('MYSQL_DB.HOST'),
      port: this.configService.get('MYSQL_DB.PORT'),
      username: this.configService.get<string>('MYSQL_DB.USER'),
      password: this.configService.get<string>('MYSQL_DB.PASSWORD'),
    };
  }

  private async createDatabase(databaseName: string) {
    await this.entityManager.query(`CREATE DATABASE ${databaseName}`);
  }

  private async initializeConnection(
    databaseName: string,
    host: string,
    port: number,
    username: string,
    password: string
  ) {
    const connection = new DataSource({
      type: 'mysql',
      host,
      port,
      username,
      password,
      database: databaseName,
      entities: [
        Company,
        CompanySubscription,
        User,
        GroupToRole,
        Roles,
        Group,
        GroupUser,
        Settings,
        RoleMenu,
        RoleCategory,
        CapabilityGroupsDepartments,
        RoleUser,
        DynamicForm,
        FormField,
        FieldValue,
        Country,
        State,
        City,
        Domain,
        MyCategory,
        Blog,
        LandingPage,
        Survey,
        SurveyQuestion,
        SurveyQuestionOption,
        Assessment,
        AssessmentQuestion,
        AssessmentQuestionOption,
      ],
      synchronize: false,
    });
    await connection.initialize();
    await connection.synchronize();
    console.log('Data Source has been initialized!');
    return connection;
  }

  private async getExpiryTime() {
    const expirySeconds = await this.settings.getItem('OTP_EXPIRY_SECONDS');
    console.log('expirySeconds', expirySeconds);
    return addSeconds(new Date(), expirySeconds);
  }

  private prepareUserData(companyData: CreateCompanyDto, expiryTime: Date) {
    const otpCode = this.generalUtility.generateOTPCode();
    return {
      email: companyData.companyEmail,
      firstName: companyData.firstName,
      lastName: companyData.lastName,
      userName: `${companyData.firstName} ${companyData.lastName}`,
      phoneNumber: companyData.phoneNumber,
      otpCode: otpCode,
      otpExpiryTime: expiryTime,
      status: 'Pending',
      countryId: companyData.countryId,
      stateId: companyData.stateId,
      city: companyData.city,
      address: companyData.address,
      companyId: 1,
    };
  }

  private prepareCompanySettingData(
    companyData: CreateCompanyDto,
    username: string,
    password: string,
    host: string,
    port: number,
    databaseName: string
  ) {
    const connectionUrl = `mysql://${username}:${password}@${host}:${port}/${databaseName}`;
    const companyPrefix = this.getCompanyPrefix(companyData.companyName);
    return {
      companyId: null,
      domain: companyPrefix,
      connectionUrl: connectionUrl,
      email: companyData.companyEmail,
      companyName: companyData.companyName,
      status: 'Pending',
    };
  }

  private prepareSubscriptionClone(
    companyData: CreateCompanyDto,
    subscriptionDetail: any
  ) {
    return {
      subscriptionId: companyData.subscriptionId,
      planCode: subscriptionDetail.planCode,
      planName: subscriptionDetail.planName,
      subscriptionStatus: 'Inactive',
      subscriptionStartDate: null,
      subscriptionExpiryDate: null,
      monthlyPlan: 1,
      subscriptionKey: randomUUID(),
      type:
        subscriptionDetail.planCode === 'SILVER' ||
        subscriptionDetail.planCode === 'GOLD'
          ? 'Basic'
          : 'Premium',
      numberOfUsers: companyData.numberOfUsers,
    };
  }

  private async performDatabaseOperations(
    connection: DataSource,
    userData: any,
    companyData: CreateCompanyDto,
    companySettingData: any,
    subscriptionClone: any
    // settingData: any
  ) {
    return await connection.transaction(async (transactionalEntityManager) => {
      const roleRepository = transactionalEntityManager.getRepository(Roles);
      const userRepository = transactionalEntityManager.getRepository(User);
      const companyRepository =
        transactionalEntityManager.getRepository(Company);
      const subscriptionRepository =
        transactionalEntityManager.getRepository(CompanySubscription);

      // const settingsRepository =
      //   transactionalEntityManager.getRepository(Settings);

      const roleUserRepository =
        transactionalEntityManager.getRepository(RoleUser);

      // Assuming roleData is prepared outside this function and passed as part of userData or another parameter
      const roleData = {
        roleCode: 'COMPANY',
        roleName: 'Company',
        status: 'Pending',
      };

      // Insert role
      await roleRepository
        .createQueryBuilder()
        .insert()
        .into(Roles)
        .values(roleData as any)
        .execute();

      // Set the roleId in roleUser to the ID of the newly created user
      const roleUser = {
        roleId: 1,
        userId: 1,
      };

      await roleUserRepository
        .createQueryBuilder()
        .insert()
        .into(RoleUser)
        .values(roleUser as any)
        .execute();

      // Insert user
      await userRepository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values(userData)
        .execute();

      // Insert subscription
      await subscriptionRepository
        .createQueryBuilder()
        .insert()
        .into(CompanySubscription)
        .values(subscriptionClone)
        .execute();

      // Insert Setting
      // await settingsRepository
      //   .createQueryBuilder()
      //   .insert()
      //   .into(Settings)
      //   .values(settingData as any)
      //   .execute();

      // Insert company
      const newCompany = await companyRepository
        .createQueryBuilder()
        .insert()
        .into(Company)
        .values({ ...companyData, companyPrefix: companySettingData?.domain }) // Assuming companySettingData contains the necessary company data
        .execute();

      companySettingData.companyId = newCompany.identifiers[0].companyId;
      // Insert company settings
      await this.companySettingRepository
        .createQueryBuilder()
        .insert()
        .into(CompanySetting)
        .values(companySettingData)
        .execute();

      return newCompany;
    });
  }

  private async getCompanySetting(companyPrefix: string) {
    return await this.companySettingRepository.findOne({
      where: { domain: companyPrefix },
    });
  }

  private getCompanyPrefix(companyName: string) {
    return companyName
      .replace(/(pvt\. LTD\.|LLC|Inc\.|Co\.)/gi, '')
      .replace(/\s+/g, '')
      .toLowerCase()
      .trim()
      .substring(0, 25);
  }
}
