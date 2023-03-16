import { YouTubeVideoDetails } from '../../models/content/content.type';

export interface WebpageDetails {
  title?: string;
  author: string;
  readingTime: string;
  categories: string[];
  summary: string;
}

export type YouTubeVideoInsights = Pick<
  YouTubeVideoDetails,
  'categories' | 'summary'
>;
