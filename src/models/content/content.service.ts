import { Inject, Injectable } from '@nestjs/common';
import { NotionService } from '../../providers/notion/notion.service';
import { InsightService } from '../../providers/insights/insight.service';
import YoutubeTranscript from 'youtube-transcript';
import { InjectRepository } from '@nestjs/typeorm';
import { Content } from './content.entity';
import { Repository } from 'typeorm';
import {
  IContent,
  Medium,
  YouTubeVideoDetails,
  YouTubeVideoMetadata,
} from './content.type';
import { Temperature } from '../../providers/openai/openai.type';
import { NotionPageDetails } from '../../providers/notion/notion.type';

@Injectable()
export class ContentService {
  constructor(
    @Inject(NotionService) private notionService: NotionService,
    @Inject(InsightService) private insightService: InsightService,
    @InjectRepository(Content) private contentRepository: Repository<Content>,
  ) {}

  async getContent(details: IContent): Promise<Content[]> {
    const where: any = {};

    if (details?.accountId) {
      where.account = {};
      where.account.id = details.accountId;
    }
    if (details?.status) where.status = details.status;

    return this.contentRepository.find({ where });
  }

  async createContent(req: any): Promise<void> {
    console.log('createContent!');
    const contentDetails = await this.getContentDetails(req.body);

    const pageDetails = await this.notionService.createPage({
      url: req.body.url,
      ...contentDetails,
    });

    // TODO - add accountId to pageDetails;

    await this.storeContent(pageDetails);
  }

  async updateContent(body: any): Promise<void> {
    await this.contentRepository.save({
      id: body.id,
      status: body.status,
    });
  }

  private async getContentDetails(body: {
    url: string;
    html: string;
  }): Promise<any> {
    const { url, html } = body;
    const medium = this.getMedium(url);

    // TODO - At what level of concerns should the temperature
    if (medium === Medium.WebPage) {
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

    if (medium === Medium.YouTube) {
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

      if (!length.includes('M')) return 0;

      if (!length.includes('H')) {
        return Number(length.split('M')[0].split('PT')[1]);
      }

      const minutes = length.split('M')[0].split('H')[1];
      const hours = length.split('H')[0].split('PT')[1];
      return Number(hours) * 60 + Number(minutes);
    }
  }

  private getMedium(url: string): Medium {
    if (url.toLowerCase().includes('www.youtube.com')) {
      return Medium.YouTube;
    }
    return Medium.WebPage;
  }

  async storeContent(contentDetails: NotionPageDetails): Promise<any> {
    try {
      const parsedContentDetails = {
        category_ids: contentDetails.categoryIds,
        title: contentDetails.title,
        creator: contentDetails.creator,
        url: contentDetails.url,
        medium: contentDetails.medium,
        categories: contentDetails.categories,
        summary: contentDetails.summary,
        time: contentDetails.time,
        notion_id: contentDetails.notionId,
      };
      return this.contentRepository.insert(parsedContentDetails);
    } catch (err) {
      throw new Error(err.message);
    }
  }
}
