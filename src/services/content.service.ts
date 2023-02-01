import { Inject, Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { NotionService } from './notion.service';
import { InsightService } from './insight.service';
import {
  ContentType,
  Medium,
  NotionPageDetails,
  YouTubeVideoDetails,
  YouTubeVideoMetadata,
} from '../types/types';
import { google } from 'googleapis';
import fs from 'fs';
import { response } from 'express';
import YoutubeTranscript from 'youtube-transcript';
import * as TextStatistics from 'text-statistics';
import { isEmpty } from 'rxjs';

@Injectable()
export class ContentService {
  constructor(
    @Inject(NotionService) private notionService: NotionService,
    @Inject(InsightService) private insightService: InsightService,
  ) {}

  async createPage(req: any): Promise<void> {
    const pageDetails = await this.getPageDetails(req.body.url, req.body.html);

    await Promise.all([
      this.storeContent(pageDetails),
      this.notionService.createPage({ url: req.body.url, ...pageDetails }),
    ]);
  }

  async getPageDetails(url: string, html: string): Promise<NotionPageDetails> {
    const contentType = this.getContentType(url);

    if (contentType === ContentType.WebPage) {
      const { title, content } = this.getWebpageTitleAndContent(html);
      // TODO - turn temperature into enum. Also consider if this should even be here? Should this be lower down?
      const { summary, author, readingTime, categories } =
        await this.insightService.extractMetaDataFromWebpage(
          `${title} ${content}`,
          0.3,
        );

      return {
        title,
        creator: author,
        categories,
        time: readingTime,
        summary,
        medium: Medium.WebPage,
      };
    }

    if (contentType === ContentType.YouTube) {
      const { title, creator, videoLength, categories, summary } =
        await this.getYouTubeVideoDetails(url);

      return {
        title,
        time: videoLength,
        creator,
        summary,
        categories,
        medium: Medium.YouTube,
      };
    }
  }

  async getYouTubeVideoDetails(url: string): Promise<YouTubeVideoDetails> {
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

  private getWebpageTitleAndContent(html: string): {
    title: string;
    content: string;
  } {
    const $ = cheerio.load(html);
    const htmlElements = $('body')
      .find('p, h1, h2, h3, h4, h5, h6, li, a, span')
      .children();

    const title = getTitle();

    let content = '';
    htmlElements.each((index, element) => {
      content += extractText($(element));
    });

    return { title, content };

    function getTitle() {
      if (!$('title').text()) return 'Title';
      if ($('title').text().length > 100) return $('title').text().slice(0, 99);
      return $('title').text();
    }

    function extractText(element): string {
      let text = '';
      if (element.text()) {
        text += element.text();
      }
      element.children().each((i, child) => {
        text += extractText($(child));
      });
      return text;
    }
  }

  private getContentType(url: string): ContentType {
    if (url.toLowerCase().includes('www.youtube.com')) {
      return ContentType.YouTube;
    }
    return ContentType.WebPage;
  }

  async storeContent(parsedHTML: any): Promise<void> {
    return;
  }
}
