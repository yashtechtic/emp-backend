import { Injectable, Inject, Scope } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(
    private readonly configService: ConfigService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  createTypeOrmOptions(connectionName?: string): TypeOrmModuleOptions {
    let databaseName: string;
    const isSystem =
      this.request.body?.isSystem || this.request.query?.isSystem;

    if (isSystem) {
      databaseName = this.configService.get<string>('MYSQL_DB.DBNAME');
    } else {
      if (isSystem === undefined) {
        databaseName =
          (this.request.headers['tenantid'] as string) ||
          this.configService.get<string>('MYSQL_DB.DBNAME');
      } else {
        const tenantId = this.request.headers['tenantid'] as string;
        if (!tenantId) {
          throw new Error('Tenant ID is required for non-system requests');
        }
        databaseName = tenantId;
      }
    }

    const commonOptions: TypeOrmModuleOptions = {
      type: 'mysql',
      host: this.configService.get<string>('MYSQL_DB.HOST'),
      port: +this.configService.get<number>('MYSQL_DB.PORT'),
      username: this.configService.get<string>('MYSQL_DB.USER'),
      password: this.configService.get<string>('MYSQL_DB.PASSWORD'),
      autoLoadEntities: true,
      synchronize: false,
      migrationsRun: false,
      logging: false,
      migrations: [__dirname + '/migrations/*.{js,ts}'],
      entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
    };

    if (connectionName === 'masterConnection') {
      return {
        ...commonOptions,
        database: 'employee_training',
      };
    }

    return {
      ...commonOptions,
      database: databaseName,
    };
  }
}
