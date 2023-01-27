import { Inject, Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { NotionService } from './notion.service';
import { InsightService } from './insight.service';
import { NotionPageDetails } from '../types/types';

@Injectable()
export class ContentService {
  constructor(
    @Inject(NotionService) private notionService: NotionService,
    @Inject(InsightService) private insightService: InsightService,
  ) {}

  async createPage(req: any): Promise<void> {
    const pageDetails = await this.getPageDetails(req.body.html);

    await Promise.all([
      this.storeContent(pageDetails),
      this.notionService.createPage({ url: req.body.url, ...pageDetails }),
    ]);
  }

  async getPageDetails(html: string): Promise<NotionPageDetails> {
    const { title, content } = this.parseTextFromHTML(html);
    const summary = await this.insightService.summariseText(content, 0.7);
    const { author, categories } = await this.insightService.categoriseText(
      summary,
      0.1,
    );
    return { title, author, categories, summary };
  }

  parseTextFromHTML(html: string): { title: string; content: string } {
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
      element.children().each((index, child) => {
        text += extractText($(child));
      });
      return text;
    }
  }

  async storeContent(parsedHTML: any): Promise<void> {
    return;
  }
}
