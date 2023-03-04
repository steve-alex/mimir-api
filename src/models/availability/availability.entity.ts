import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  EntityRepository,
  Repository,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Account } from '../accounts/account.entity';

@Entity({ name: 'availability' })
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (account) => account.id)
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({ type: 'varchar' })
  day_of_week: string; // Thursday, Friday, etc.

  @Column({ type: 'time' })
  start_time: string; // 05:00:00, 06:00:00, etc.

  @Column({ type: 'time' })
  end_time: string; // 06:00:00, 07:00:00, etc.

  @Column()
  deleted: boolean;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}

@EntityRepository(Availability)
export class AvailabilityRepository extends Repository<Availability> {}
