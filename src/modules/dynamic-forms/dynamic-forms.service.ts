import { AutocompleteDto } from '@app/common-config/dto/common.dto';
import {
  IFormAutoComplete,
  IFormDetail,
} from '@app/interfaces/companies/dynamic-form.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DynamicForm } from './entities/dynamic-form.entity';
import { Repository } from 'typeorm';
import { FormField } from './entities/form-field.entity';
import { FieldValue } from './entities/field-value.entity';

@Injectable()
export class DynamicFormsService {
  constructor(
    @InjectRepository(DynamicForm)
    private formRepository: Repository<DynamicForm>,
    @InjectRepository(FormField)
    private formFieldRepository: Repository<FormField>,
    @InjectRepository(FieldValue)
    private fieldValueRepository: Repository<FieldValue>
  ) {}

  async formDetail(formId: number): Promise<IFormDetail> {
    const formDetails = await this.formRepository
      .createQueryBuilder('f')
      .select(['f.formId as formId', 'f.formName as formName'])
      .where(`f.formId = :formId`, { formId })
      .getRawOne();

    if (formDetails) {
      const formFields = await this.formFieldRepository
        .createQueryBuilder('fe')
        .innerJoin(FieldValue, 'fv', 'fv.fieldId = fe.fieldId')
        .select([
          'fe.fieldName as fieldName',
          'fe.fieldType as fieldType',
          'fe.isRequired as isRequired',
          'fe.fieldId as fieldId',
          'fv.value as value',
          'fv.extraFields as extraFields',
          'fv.valueId as valueId',
        ])
        .where(`fe.formId = :formId`, { formId })
        .getRawMany();

      const restructuredData = formFields.reduce((acc, item) => {
        let field = acc.find((f: any) => f.fieldId === item.fieldId);
        if (!field) {
          field = {
            fieldId: item.fieldId,
            fieldName: item.fieldName,
            fieldType: item.fieldType,
            isRequired: item.isRequired,
            fieldValues: [],
          };
          acc.push(field);
        }
        field.fieldValues.push({
          valueId: item.valueId,
          value: item.value,
          extraFields: item.extraFields,
        });
        return acc;
      }, []);

      formDetails.formFields = restructuredData;
    }

    return formDetails;
  }

  formAutocomplete(condition?: AutocompleteDto): Promise<IFormAutoComplete[]> {
    const queryBuilder = this.formRepository
      .createQueryBuilder('d')
      .select(['d.formId as formId', 'd.formName as formName']);

    if (condition) {
      if (condition.keyword) {
        queryBuilder.andWhere('d.formName LIKE :keyword', {
          keyword: `%${condition.keyword}%`,
        });
      }
      return queryBuilder.getRawMany();
    }
  }
}
