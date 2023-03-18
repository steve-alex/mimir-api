export interface WebpageDetails {
  title?: string;
  author: string;
  readingTime: string;
  categories: string[];
  summary: string;
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

export type YouTubeVideoInsights = Pick<
  YouTubeVideoDetails,
  'categories' | 'summary'
>;
