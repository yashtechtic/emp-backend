import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('dynamic_forms')
export class DynamicForm {
  @PrimaryGeneratedColumn({ name: 'iFormId' })
  formId: number;

  @Column({ name: 'vFormName' })
  formName: string;

  @CreateDateColumn({ name: 'dtAddedDate' })
  addedDate?: Date;
}
