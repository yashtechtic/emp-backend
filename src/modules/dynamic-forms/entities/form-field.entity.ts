import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('form_fields')
export class FormField {
  @PrimaryGeneratedColumn({ name: 'iFieldId' })
  fieldId: number;

  @Column({ name: 'iFormId' })
  formId: number;

  @Column({ name: 'iFieldName' })
  fieldName: string;

  @Column({ name: 'iFieldType' })
  fieldType: string;

  @Column({ name: 'iIsRequired' })
  isRequired: boolean;

  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate?: Date;
}
