import { Status } from '../../models/content/content.entity';
import { Medium } from '../../models/content/content.type';

export interface NotionPageDetails {
  title?: string;
  creator?: string;
  url?: string;
  medium?: Medium;
  categories?: string[];
  summary?: string;
  time?: number;
  status?: Status;
  notionId?: string;
  categoryIds?: string[];
}
