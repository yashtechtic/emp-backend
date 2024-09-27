import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { config } from 'dotenv';
import { createConnection, Connection } from 'mysql2/promise';

// Load environment variables from .env file
config();
// Import entities
import { RootDomain } from './modules/domains/entities/root-domain.entity';
import { Admin } from './modules/admin/entities/admin.entity';
import { Country } from './modules/country/entities/country.entity';
import { Course } from './modules/course/entities/course.entity';
import { State } from './modules/state/entities/state.entity';
import { Assessment } from './modules/assessments/entities/assessment.entity';
import { AssessmentQuestion } from './modules/assessments/entities/assessment-question.entity';
import { Blog } from './modules/blogs/entities/blog.entity';
import { City } from './modules/city/entities/city.entity';
import { CompanySetting } from './modules/company/entities/company-setting.entity';
import { Content } from './modules/content/entities/content.entity';
import { CapabilityMaster } from './modules/admin-role/entities/admin-role-capability-master.entity';
import { CapabilityCategory } from './modules/admin-role/entities/admin-role-capability.entity';
import { Roles } from './modules/admin-role/entities/admin-role.entity';
import { DynamicForm } from './modules/dynamic-forms/entities/dynamic-form.entity';
import { FieldValue } from './modules/dynamic-forms/entities/field-value.entity';
import { FormField } from './modules/dynamic-forms/entities/form-field.entity';
import { LandingPage } from './modules/landing-pages/entities/landing-page.entity';
import { MyCategory } from './modules/my-categories/entities/my-category.entity';
import { NotificationTemplate } from './modules/notification-template/entities/notification-template.entity';
import { AssessmentQuestionOption } from './modules/assessments/entities/assessment-qs-options.entity';
import { Survey } from './modules/survey/entities/survey.entity';
import { PhishingGroupDept } from './modules/phishing-simulation/entities/phishing-group-dept.entity';
import { PhishingSimulation } from './modules/phishing-simulation/entities/phishing-simulation.entity';
import { PhishingTemplate } from './modules/phishing-template/entities/phishing-template.entity';
import { Policy } from './modules/policies/entities/policy.entity';
import { Settings } from './modules/settings/entities/setting.entity';
import { SurveyQuestion } from './modules/survey/entities/survey-question.entity';
import { SurveyQuestionOption } from './modules/survey/entities/survey-qs-options.entity';
import { Company } from './modules/company/entities/company.entity';
import { User } from './modules/users/entities/user.entity';
import { CompanySubscription } from './modules/company/entities/company-subscription.entity';
import { Group } from './modules/user-group/entity/group.entity';
import { GroupUser } from './modules/user-group/entity/user-group.entity';
import { GroupToRole } from './modules/user-group/entity/group-role-association.entity';
import { Roles as CompanyRole } from './modules/company-roles/entities/company-role.entity';
import { CapabilityGroupsDepartments } from './modules/company-roles/entities/capability-groups-dept.entity';
import { Domain } from './modules/domains/entities/domain.entity';
import { Subscription } from './modules/subscription/entities/subscription.entity';
import { RoleCategory } from './modules/company-roles/entities/company-role-category.entity';
import { RoleMenu } from './modules/company-roles/entities/company-role-menu.entity';

// Create a list of entities
const commonEntities = [
  Country,
  Course,
  State,
  Assessment,
  AssessmentQuestion,
  AssessmentQuestionOption,
  City,
  Content,
  LandingPage,
  MyCategory,
  NotificationTemplate,
  PhishingGroupDept,
  PhishingSimulation,
  PhishingTemplate,
  Policy,
  Settings,
  Survey,
  SurveyQuestion,
  SurveyQuestionOption,
  Domain,
];
const entities = [
  Admin,
  Blog,
  CompanySetting,
  RootDomain,
  CapabilityMaster,
  CapabilityCategory,
  Roles,
  DynamicForm,
  FieldValue,
  FormField,
  Subscription,
  ...commonEntities,
];

const companyEntities = [
  Company,
  User,
  CompanySubscription,
  Group,
  GroupUser,
  GroupToRole,
  CapabilityGroupsDepartments,
  RoleCategory,
  CompanyRole,
  RoleMenu,
  ...commonEntities,
];

// Common DataSource configuration
const createDataSourceConfig = (
  url: string,
  entities: any
): DataSourceOptions => ({
  type: 'mysql',
  url,
  ssl: false,
  synchronize: true, // Set to true to automatically create tables based on entities
  logging: true,
  logger: 'file',
  entities,
  migrations: [join(__dirname, 'migrations', '**/*{.ts,.js}')],
});

// Function to create a DataSource for a given database URL
const createDataSource = (url: string, entities: any): DataSource => {
  return new DataSource(createDataSourceConfig(url, entities));
};

// Function to fetch company database URLs from employee_database
const getCompanyDatabaseUrls = async (): Promise<string[]> => {
  let connection: Connection | undefined;
  try {
    connection = await createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'root',
      database: process.env.DB_NAME || 'employee_training',
    });

    const [rows]: any = await connection.execute(
      'SELECT vConnectionUrl as connectionUrl FROM company_settings'
    );

    return rows.map((row: any) => row.connectionUrl);
  } catch (error) {
    console.error('Error fetching company database URLs:', error);
    return [];
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Function to run migrations for all company databases
const runMigrationsForAllCompanies = async (): Promise<void> => {
  const companyDatabaseUrls = await getCompanyDatabaseUrls(); // Fetch the URLs

  for (const url of companyDatabaseUrls) {
    const dataSource = createDataSource(url, companyEntities);

    try {
      await dataSource.initialize();
      await dataSource.runMigrations();
      console.log(`Migrations run successfully for database: ${url}`);
    } catch (err) {
      console.error(`Error running migrations for database: ${url}`, err);
    } finally {
      await dataSource.destroy();
    }
  }
};

// Function to run migrations for the employee database
const runMigrationsForEmployeeDatabase = async (): Promise<void> => {
  const employeeDataSource = createDataSource(
    process.env.EMPLOYEE_DB_URL ||
      `mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:3306/employee_training`,
    entities
  );

  try {
    await employeeDataSource.initialize();
    await employeeDataSource.runMigrations();
    console.log(`Migrations run successfully for employee database`);
  } catch (err) {
    console.error(`Error running migrations for employee database`, err);
  } finally {
    await employeeDataSource.destroy();
  }
};

export const companyDataSource = runMigrationsForAllCompanies();
export const employeeyDataSource = runMigrationsForEmployeeDatabase();
const connectionSource = createDataSource(
  process.env.EMPLOYEE_DB_URL ||
    `mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:3306/employee_training`,
  entities
);

export default connectionSource;
