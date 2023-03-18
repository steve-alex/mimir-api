import { Status } from './content.entity';

export interface IContent {
  accountId?: number;
  status?: Status;
}

export enum Medium {
  YouTube = 'youtube',
  WebPage = 'webpage',
}