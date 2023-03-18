import { Inject, Injectable } from '@nestjs/common';
import { NotionService } from '../../providers/notion/notion.service';
import { InsightService } from '../../providers/insights/insight.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Content } from './content.entity';
import { Repository } from 'typeorm';
import { NotionPageDetails } from '../../providers/notion/notion.type';
import { Medium } from './content.type';

@Injectable()
export class ContentService {
  constructor(
    @Inject(NotionService) private notionService: NotionService,
    @Inject(InsightService) private insightService: InsightService,
    @InjectRepository(Content) private contentRepository: Repository<Content>,
  ) {}

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

  async getContent(details: IContent): Promise<Content[]> {
    const where: any = {};

    if (details?.accountId) {
      where.account = {};
      where.account.id = details.accountId;
    }
    if (details?.status) where.status = details.status;

    return this.contentRepository.find({ where });
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

    if (medium === Medium.WebPage) {
      const { title, author, categories, summary, readingTime } =
        await this.insightService.getWebPageDetails(html);

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
        await this.insightService.getYouTubeVideoDetails(url);

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

  private getMedium(url: string): Medium {
    if (url.toLowerCase().includes('www.youtube.com')) {
      return Medium.YouTube;
    }
    return Medium.WebPage;
  }
}
