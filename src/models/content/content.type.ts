import { Status } from './content.entity';

export interface ContentDTO {
  accountId?: number;
  title?: string;
  summary?: string;
  creator?: string;
  categories?: string[];
  categories_id?: string[];
  url?: string;
  time?: number;
  status?: Status;
  medium?: Medium;
  created_date?: Date;
  updated_date?: Date;
}

export enum Medium {
  YouTube = 'youtube',
  WebPage = 'webpage',
}
