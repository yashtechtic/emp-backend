import { Module } from '@nestjs/common';
import { SystemEmailController } from './systemEmail.controller';
import { SystemEmailService } from './systemEmail.service';
import { ServicesModule } from '@app/services';
import { UtilitiesModule } from '@app/utilities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemEmail } from './entities/systemEmail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemEmail]),
    ServicesModule,
    UtilitiesModule,
  ],
  controllers: [SystemEmailController],
  providers: [SystemEmailService],
})
export class SystemEmailModule {}
