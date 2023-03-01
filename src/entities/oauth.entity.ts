import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  EntityRepository,
  Repository,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from '../models/accounts/account.entity';

enum OauthProvider {
  GoogleCalendar = 'google_calendar',
}

@Entity({ name: 'account' })
export class OAuth {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (account) => account.id)
  account: Account;

  @Column({
    type: 'enum',
    enum: OauthProvider,
    default: OauthProvider.GoogleCalendar,
  })
  provider: OauthProvider;

  @Column()
  valid: boolean;

  @Column()
  access_token: string;

  @Column()
  refresh_token: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}

@EntityRepository(Account)
export class OauthRepository extends Repository<OAuth> {}
