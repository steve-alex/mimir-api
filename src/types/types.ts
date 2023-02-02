export class UserDTO {
  id: number;
  name: string;
}
export class CreateUserDTO {
  name: string;
}

export class UpdateUserDTO {
  id: number;
  name: string;
}

export interface NotionPageDetails {
  title?: string;
  creator?: string;
  time?: string;
  categories?: string[];
  summary?: string;
  url?: string;
  medium?: Medium;
}

export enum Medium {
  YouTube = 'youtube',
  WebPage = 'webpage',
}

export interface WebpageDetails {
  author: string;
  readingTime: string;
  categories: string[];
  summary: string;
}

export interface YouTubeVideoDetails {
  title: string;
  creator: string;
  videoLength: string;
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

export interface Response {
  data?: any;
  message: string;
  statusCode: number;
}
