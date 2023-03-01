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
import { Account } from '../models/accounts/account.entity';

export enum OAuthProvider {
  GoogleCalendar = 'google_calendar',
}

@Entity({ name: 'oauth' })
export class OAuth {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (account) => account.id)
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({
    type: 'enum',
    enum: OAuthProvider,
    default: OAuthProvider.GoogleCalendar,
  })
  provider: OAuthProvider;

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

@EntityRepository(OAuth)
export class OAuthRepository extends Repository<OAuth> {}
