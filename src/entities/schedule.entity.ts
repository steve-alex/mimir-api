import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  EntityRepository,
  Repository,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from '../models/accounts/account.entity';

@Entity({ name: 'schedule' })
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { array: true })
  daysOfWeek: number[];

  @Column('text', { array: true })
  timesOfDay: string[];

  @OneToOne(() => Account, (account) => account.id)
  @JoinColumn()
  account: Account;
}

@EntityRepository(Schedule)
export class ScheduleRepository extends Repository<Schedule> {}
