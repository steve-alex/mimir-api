export class UpdateUserDTO {
  id: number;
  name: string;
}

export interface NotionPageDetails {
  title?: string;
  creator?: string;
  url?: string;
  medium?: Medium;
  categories?: string[];
  summary?: string;
  time?: string;
}

export enum Medium {
  YouTube = 'youtube',
  WebPage = 'webpage',
}

export interface WebpageDetails {
  title?: string; //TODO change this!
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

export enum ContentType {
  YouTube = 'youtube',
  WebPage = 'web-page',
}

export interface Response<T> {
  data?: T;
  message: string;
  statusCode: number;
}

// Controls the randomness of the response from GPT 3
export enum Temperature {
  Min = 0,
  Low = 0.25,
  Medium = 0.5,
  High = 0.75,
  Max = 1,
}
