import { Inject, Injectable } from '@nestjs/common';
import * as rawBody from 'raw-body';
import * as cheerio from 'cheerio';
import { NotionService } from './notion.service';

@Injectable()
export class ContentService {
  constructor(@Inject(NotionService) private notionService: NotionService) {}

  async createPage(req: any): Promise<void> {
    const domObject = await this.parseRawHTMLForNotion(req);
    console.log(
      '🚀 ~ file: content.service.ts:12 ~ ContentService ~ createPage ~ domObject',
      domObject,
    );
    // await this.storeContent(domObject);
    await this.notionService.createPage(domObject);
  }

  async parseRawHTMLForNotion(req: any): Promise<any> {
    const html = await rawBody(req);
    const $ = cheerio.load(html);
    const array = [];

    buildArray(
      $('body').children().find('p, h1, h2, h3, h4, h5, h6, li, a, span'),
      array,
    );

    const parsedArray = array
      .filter(
        (i) =>
          i.tag !== 'code' &&
          i.tag !== 'img' &&
          i.tag !== 'svg' &&
          i.tag !== 'div',
      )
      .filter((i) => i.text !== '');

    return parsedArray;

    function buildArray(element, tree) {
      element.children().each(function (i, elem) {
        const item = {
          tag: elem.tagName,
          text: $(this).text(),
          attributes: elem.attributes,
          children: [],
        };
        tree.push(item);
        if ($(this).children().length > 0) {
          item.children = [];
          buildArray($(this), item.children);
        }
      });
    }
  }

  async storeContent(parsedHTML: any): Promise<void> {
    return;
  }
}
