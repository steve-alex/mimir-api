import { Status } from './content.entity';

export interface IContent {
  accountId?: number;
  status?: Status;
}
//TODO - Different name for this?

export enum Medium {
  YouTube = 'youtube',
  WebPage = 'webpage',
}
