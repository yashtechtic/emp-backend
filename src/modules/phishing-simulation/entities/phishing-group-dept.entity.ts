import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PhishingSimulation } from './phishing-simulation.entity';

@Entity('phishing_group_dept')
export class PhishingGroupDept {
  @PrimaryGeneratedColumn({ name: 'iPhishingGroupDeptId' })
  phishingGroupDeptId?: number;

  @Column({ name: 'iSelectedId' })
  selectedId: number;

  @Column({ name: 'vSelectedType' })
  selectedType: string;

  @Column({ name: 'iPhishingSimulationId' })
  phishingSimulationId: number;

  @ManyToOne(
    () => PhishingSimulation,
    (phishingSimulation) => phishingSimulation.groupDeptIds
  )
  @JoinColumn({ name: 'iPhishingSimulationId' }) // Specify the foreign key column name here
  groupDeptIds: PhishingSimulation;
}
