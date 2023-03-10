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
import { Account } from '../accounts/account.entity';
import { Medium } from './content.type';

export enum Status {
  Inbox = 'Inbox',
  Saved = 'Saved',
  Archive = 'Archive',
  Done = 'Done',
}

@Entity({ name: 'content' })
export class Content {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  notion_id: string;

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
  time: number;

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
