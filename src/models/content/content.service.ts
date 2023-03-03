import { Inject, Injectable } from '@nestjs/common';
import { NotionService } from '../../providers/notion/notion.service';
import { InsightService } from '../../providers/insights/insight.service';
import {
  ContentType,
  Medium,
  Temperature,
  YouTubeVideoDetails,
  YouTubeVideoMetadata,
} from '../../types/types';
import YoutubeTranscript from 'youtube-transcript';
import { InjectRepository } from '@nestjs/typeorm';
import { Content } from './content.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContentService {
  constructor(
    @Inject(NotionService) private notionService: NotionService,
    @Inject(InsightService) private insightService: InsightService,
    @InjectRepository(Content) private contentRepository: Repository<Content>,
  ) {}

  async createContent(req: any): Promise<void> {
    console.log('createPage!');
    const contentDetails = await this.getContentDetails(req.body);
    // eslint-disable-next-line prettier/prettier
    console.log('🚀 ~ file: content.service.ts:29 ~ ContentService ~ createPage ~ contentDetails', contentDetails);

    const { pageDetails, status } = await this.notionService.createPage({
      url: req.body.url,
      ...contentDetails,
    });
    console.log(
      '🚀 ~ file: content.service.ts:34 ~ ContentService ~ createContent ~ pageDetails:',
      pageDetails,
    );
    console.log(
      '🚀 ~ file: content.service.ts:31 ~ ContentService ~ createContent ~ status:',
      status,
    );

    if (status === 'SUCCESS') {
      await this.storeContent(pageDetails);
    }
  }

  private async getContentDetails(body: {
    url: string;
    html: string;
  }): Promise<any> {
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

    function getVideoLength(length: string): number {
      // PT13M47S
      // PT1H24M13S

      if (!length.includes('M')) return 0;;

      if (!length.includes('H')) {
        return Number(length.split('M')[0].split('PT')[1]);
      }

      const minutes = length.split('M')[0].split('H')[1];
      const hours = length.split('H')[0].split('PT')[1];
      return Number(hours) * 60 + Number(minutes);
    }
  }

  private getContentType(url: string): ContentType {
    if (url.toLowerCase().includes('www.youtube.com')) {
      return ContentType.YouTube;
    }
    return ContentType.WebPage;
  }

  async storeContent(contentDetails: any): Promise<any> {
    try {
      const parsedContentDetails = {
        category_ids: contentDetails.categoryIds.map((item) => item.id),
        title: contentDetails.title,
        creator: contentDetails.creator,
        url: contentDetails.url,
        medium: contentDetails.medium,
        categories: contentDetails.categories,
        summary: contentDetails.summary,
        time: contentDetails.time,
      };
      console.log(
        '🚀 ~ file: content.service.ts:165 ~ ContentService ~ storeContent ~ parsedContentDetails:',
        parsedContentDetails,
      );
      return this.contentRepository.insert(parsedContentDetails);
    } catch (err) {
      console.log(
        '🚀 ~ file: content.service.ts:171 ~ ContentService ~ storeContent ~ err:',
        err,
      );
      throw new Error(err.message);
    }
  }
}
