import { Module } from '@nestjs/common';
import { DynamicFormsService } from './dynamic-forms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicForm } from './entities/dynamic-form.entity';
import { FormField } from './entities/form-field.entity';
import { FieldValue } from './entities/field-value.entity';
import { ServicesModule } from '@app/services/services.module';
import { UtilitiesModule } from '@app/utilities/utilities.module';
import { DynamicFormsController } from './dynamic-forms.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DynamicForm, FormField, FieldValue]),
    ServicesModule,
    UtilitiesModule,
  ],
  controllers: [DynamicFormsController],
  providers: [DynamicFormsService],
})
export class DynamicFormsModule {}
