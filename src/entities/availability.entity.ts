import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  EntityRepository,
  Repository,
  ManyToOne,
} from 'typeorm';
import { Account } from '../models/accounts/account.entity';

@Entity({ name: 'availability' })
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (account) => account.id)
  account: Account;

  @Column({ type: 'date' })
  start: string;

  @Column({ type: 'date' })
  end: string;
}

@EntityRepository(Availability)
export class AvailabilityRepository extends Repository<Availability> {}
