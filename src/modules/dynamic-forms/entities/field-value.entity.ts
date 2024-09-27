import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('field_values')
export class FieldValue {
  @PrimaryGeneratedColumn({ name: 'iValueId' })
  valueId: number;

  @Column({ name: 'iFieldId', nullable: true })
  fieldId: number;

  @Column({ name: 'tValue' })
  value: string;

  @Column({ name: 'tTableName', nullable: true })
  tableName: string;

  @Column({ name: 'tColumnName', nullable: true })
  columnName: string;

  @Column({ name: 'jExtraFields', type: 'json', nullable: true })
  extraFields: any;
}
