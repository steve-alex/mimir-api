import { Status } from './content.entity';

export interface IContent {
  accountId?: number;
  status?: Status;
}

export enum Medium {
  YouTube = 'youtube',
  WebPage = 'webpage',
}

export interface YouTubeVideoDetails {
  title: string;
  creator: string;
  videoLength: number;
  categories: string[];
  summary: string;
}

export type YouTubeVideoMetadata = Pick<
  YouTubeVideoDetails,
  'title' | 'creator' | 'videoLength'
>;

export enum ContentType {
  YouTube = 'youtube',
  WebPage = 'web-page',
}
