import { Module } from '@nestjs/common';
import { ServicesModule } from '@app/services/services.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilitiesModule } from '@app/utilities/utilities.module';
import { JwtService } from '@nestjs/jwt';

import { JwtModule } from '@nestjs/jwt';
import { GeneralUtility } from '@app/utilities/general.utility';
import { JwtTokenService } from '@app/services/services/jwt-token.service';
import { UserAuthController } from './user-auth.controller';
import { UserAuthService } from './user-auth.service';
import { JwtStrategy } from '@app/guards/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { RoleMenu } from '../company-roles/entities/company-role-menu.entity';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RoleMenu]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || '$3cr3t',
      signOptions: { expiresIn: '1d' },
    }),
    ServicesModule,
    UtilitiesModule,
    CompanyModule,
  ],
  controllers: [UserAuthController],
  providers: [
    UserAuthService,
    JwtService,
    JwtStrategy,
    GeneralUtility,
    JwtTokenService,
  ],
})
export class UserAuthModule {}
