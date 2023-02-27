import {
  Entity,
  PrimaryGeneratedColumn,
  EntityRepository,
  Repository,
  Column,
  ManyToOne,
} from 'typeorm';
import { Medium } from '../types/types';
import { Account } from './account.entity';

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
  account: Account;

  @Column()
  name: string;

  @Column()
  summary: string;

  @Column()
  creator: string;

  @Column('text', { array: true })
  categories: string[];

  @Column()
  link: string;

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
}

@EntityRepository(Content)
export class ContentRepository extends Repository<Content> {}
