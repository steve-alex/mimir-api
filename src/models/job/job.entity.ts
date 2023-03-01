import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  EntityRepository,
  Repository,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Account } from '../accounts/account.entity';

export enum JobStatus {
  Pending = 'pending',
  Success = 'success',
  Failure = 'failure',
}

@Entity({ name: 'job' })
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  ran_at: string;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.Pending,
  })
  status: JobStatus;

  @OneToOne(() => Account, (account) => account.id)
  @JoinColumn()
  account: Account;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}

@EntityRepository(Job)
export class JobRepository extends Repository<Job> {}
