import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  EntityRepository,
  Repository,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'account' })
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}

@EntityRepository(Account)
export class AccountRepository extends Repository<Account> {}
