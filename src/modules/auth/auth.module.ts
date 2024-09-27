import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { CapabilityMaster } from '../admin-role/entities/admin-role-capability-master.entity';

import { Admin } from '../admin/entities/admin.entity';

import { ServicesModule } from '@app/services/services.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilitiesModule } from '@app/utilities/utilities.module';
import { JwtService } from '@nestjs/jwt';

import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../guards/jwt.strategy';
import { AdminMenu } from './entities/adminMenu.entity';
import { AdminPasswords } from './entities/adminPasswords.entity';
import { LogHistory } from './entities/logHistory.entity';
import { GeneralUtility } from '@app/utilities/general.utility';
import { JwtTokenService } from '@app/services/services/jwt-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      CapabilityMaster,
      AdminMenu,
      LogHistory,
      AdminPasswords,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || '$3cr3t',
      signOptions: { expiresIn: '1d' },
    }),
    ServicesModule,
    UtilitiesModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    JwtStrategy,
    GeneralUtility,
    JwtTokenService,
  ],
})
export class AuthModule {}
