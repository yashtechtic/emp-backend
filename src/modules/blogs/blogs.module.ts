import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from '@app/services/services.module';
import { UtilitiesModule } from '@app/utilities/utilities.module';
import { Blog } from './entities/blog.entity';
import { CommonConfigModule } from '@app/common-config/common-config.module';

@Module({
  controllers: [BlogsController],
  providers: [BlogsService],
  imports: [
    TypeOrmModule.forFeature([Blog]),
    ServicesModule,
    UtilitiesModule,
    CommonConfigModule,
  ],
})
export class BlogsModule {}
