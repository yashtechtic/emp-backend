import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmConfig } from './typeOrmConfig';
import configuration from './config';

import { ServicesModule } from '@app/services/services.module';
import { Loggermodule } from '@app/logger';
import { UtilitiesModule } from '@app/utilities';

import { CountryModule } from './modules/country/country.module';
import { StateModule } from './modules/state/state.module';
import { SystemEmailModule } from './modules/system-email/systemEmail.module';

import { AdminModule } from './modules/admin/admin.module';
import { RoleMasterModule } from './modules/admin-role/admin-roles.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { AuthModule } from './modules/auth/auth.module';
import { CityModule } from './modules/city/city.module';
import { RestModule } from './modules/rest/rest.module';
import { CompanyModule } from './modules/company/company.module';
import { UsersModule } from './modules/users/users.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
// import { TenantMiddleware } from './middleware/tenant.middleware';
import { AuthStrategyMiddleware } from './middleware/auth.middleware';
import { UserGroupModule } from './modules/user-group/user-group.module';
import { CompanyRolesModule } from './modules/company-roles/company-roles.module';
import { UserAuthModule } from './modules/user-auth/user-auth.module';
import { DynamicFormsModule } from './modules/dynamic-forms/dynamic-forms.module';
import { LandingPagesModule } from './modules/landing-pages/landing-pages.module';
import { DomainsModule } from './modules/domains/domains.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { MyCategoriesModule } from './modules/my-categories/my-categories.module';
import { PhisingSimulationModule } from './modules/phishing-simulation/phishing-simulation.module';
import { PhisingTemplateModule } from './modules/phishing-template/phishing-template.module';
import { PhisingCampignModule } from './modules/phishing-campaign/phishing-campaign.module';
import { NotificationTemplateModule } from './modules/notification-template/notification-template.module';
import { PoliciesModule } from './modules/policies/policies.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { SurveyModule } from './modules/survey/survey.module';
import { ContentModule } from './modules/content/content.module';
import { CourseModule } from './modules/course/course.module';
import { CronModule } from './jobs/cron.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      name: 'masterConnection',
      useClass: TypeOrmConfig,
      inject: [ConfigService],
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [REQUEST],
    //   useFactory: async (request: any) => {
    //     const tenantConnectionManager = new TenantConnectionManager();
    //     // Assuming TenantConnectionManager has a method to get connection options based on request
    //     return tenantConnectionManager.getConnectionOptions(request);
    //   },
    //   scope: Scope.REQUEST, // This is crucial for making the connection request-scoped
    // }),

    Loggermodule.forRoot({
      errorPath: process.env.ERROR_LOG_PATH,
      logPath: process.env.DEBUG_LOG_PATH,
      serviceName: 'admin-service',
      nodeEnv: process.env.NODE_ENV,
    }),
    CronModule,
    ServicesModule,
    UtilitiesModule,
    CountryModule,
    StateModule,
    CityModule,
    RoleMasterModule,
    SystemEmailModule,
    AdminModule,
    AuthModule,
    RestModule,
    CompanyModule,
    UsersModule,
    CompanyRolesModule,
    SubscriptionModule,
    UserGroupModule,
    UserAuthModule,
    DynamicFormsModule,
    LandingPagesModule,
    DomainsModule,
    BlogsModule,
    MyCategoriesModule,
    PhisingSimulationModule,
    PhisingTemplateModule,
    PhisingCampignModule,
    NotificationTemplateModule,
    PoliciesModule,
    AssessmentsModule,
    SurveyModule,
    ContentModule,
    CourseModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AppService,
  ],
  exports: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(TenantMiddleware).forRoutes('*'); // Apply globally or specify routes
    consumer
      .apply(AuthStrategyMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL }); // Apply globally or specify routes
  }
}
