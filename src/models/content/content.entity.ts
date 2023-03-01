import {
  Entity,
  PrimaryGeneratedColumn,
  EntityRepository,
  Repository,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Medium } from '../../types/types';
import { Account } from '../accounts/account.entity';

export enum Status {
  Inbox = 'inbox',
  Saved = 'saved',
  Archive = 'archive',
  Done = 'done',
}

@Entity({ name: 'content' })
export class Content {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (account) => account.id)
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column()
  title: string;

  @Column()
  summary: string;

  @Column()
  creator: string;

  @Column('text', { array: true })
  categories: string[];

  @Column('text', { array: true })
  category_ids: string[];

  @Column()
  url: string;

  @Column()
  time: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Inbox,
  })
  status: Status;

  @Column({
    type: 'enum',
    enum: Medium,
    default: Medium.WebPage,
  })
  medium: Medium;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}

@EntityRepository(Content)
export class ContentRepository extends Repository<Content> {}
