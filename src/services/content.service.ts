import { Inject, Injectable } from '@nestjs/common';
import { NotionService } from './notion.service';
import { InsightService } from './insight.service';
import {
  ContentType,
  Medium,
  NotionPageDetails,
  Temperature,
  YouTubeVideoDetails,
  YouTubeVideoMetadata,
} from '../types/types';
import YoutubeTranscript from 'youtube-transcript';

@Injectable()
export class ContentService {
  constructor(
    @Inject(NotionService) private notionService: NotionService,
    @Inject(InsightService) private insightService: InsightService,
  ) {}

  async createContent(req: any): Promise<void> {
    console.log('createPage!');
    const contentDetails = await this.getContentDetails(req.body);
    // eslint-disable-next-line prettier/prettier
    console.log('🚀 ~ file: content.service.ts:29 ~ ContentService ~ createPage ~ contentDetails', contentDetails);

    await Promise.all([
      this.storeContent(contentDetails),
      this.notionService.createPage({ url: req.body.url, ...contentDetails }),
    ]);
  }

  private async getContentDetails(body: {
    url: string;
    html: string;
  }): Promise<NotionPageDetails> {
    const { url, html } = body;
    const contentType = this.getContentType(url);
    // eslint-disable-next-line prettier/prettier
    console.log('🚀 ~ file: content.service.ts:42 ~ ContentService ~ getPageDetails ~ contentType', contentType);

    // TODO - At what level of concerns should the temperature
    if (contentType === ContentType.WebPage) {
      const { title, author, categories, summary, readingTime } =
        await this.insightService.getWebPageDetails(html, Temperature.Low);

      return {
        title,
        creator: author,
        medium: Medium.WebPage,
        categories,
        summary,
        time: readingTime,
      };
    }

    if (contentType === ContentType.YouTube) {
      const { title, creator, categories, summary, videoLength } =
        await this.getYouTubeVideoDetails(url);

      return {
        title,
        creator,
        medium: Medium.YouTube,
        categories,
        summary,
        time: videoLength,
      };
    }
  }

  private async getYouTubeVideoDetails(
    url: string,
  ): Promise<YouTubeVideoDetails> {
    const videoId = url.split('v=')[1];

    const [transcript, { title, creator, videoLength }] = await Promise.all([
      await YoutubeTranscript.fetchTranscript(videoId),
      await this.getYouTubeVideoMetadata(videoId),
    ]);

    const content = transcript.reduce((acc, curr) => {
      return acc + `${curr.text} `;
    }, '');

    const { categories, summary } =
      await this.insightService.extractYouTubeVideoInsights(content);

    return {
      title,
      creator,
      videoLength,
      categories,
      summary,
    };
  }

  private async getYouTubeVideoMetadata(
    videoId: string,
  ): Promise<YouTubeVideoMetadata> {
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${process.env.YOUTUBE_API_KEY}`;
    const response = await fetch(url);

    const data = await response.json();
    const item = data.items[0];

    return {
      title: item.snippet.title,
      videoLength: getVideoLength(item.contentDetails.duration),
      creator: item.snippet.channelTitle,
    };

    function getVideoLength(length: string): string {
      // PT13M47S
      // PT1H24M13S

      if (!length.includes('M')) return '< 1 Minute';

      if (!length.includes('H')) {
        const minutes = length.split('M')[0].split('PT')[1];
        return `${minutes} Minutes`;
      }

      const minutes = length.split('M')[0].split('H')[1];
      const hours = length.split('H')[0].split('PT')[1];

      return `${hours} Hour${Number(hours) > 1 ? 's' : ''} ${minutes} Minutes`;
    }
  }

  private getContentType(url: string): ContentType {
    if (url.toLowerCase().includes('www.youtube.com')) {
      return ContentType.YouTube;
    }
    return ContentType.WebPage;
  }

  async storeContent(contentDetails: any): Promise<void> {
    //TODO - create a type for contentDetails!
    return;
  }
}
