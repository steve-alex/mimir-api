import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { NotionPageDetails } from '../types/types';

@Injectable()
export class NotionService {
  notion;
  baseUrl = 'https://api.notion.com/v1';

  constructor() {
    this.notion = new Client({ auth: process.env.NOTION_API_KEY });
  }

  async createPage(pageDetails: NotionPageDetails): Promise<void> {
    const { title, categories, summary, url } = pageDetails;

    const multiSelect = categories.map((c) => ({ name: c }));

    await this.notion.pages.create({
      parent: {
        type: 'database_id',
        database_id: process.env.NOTION_DB_ID,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        Categories: {
          multi_select: multiSelect,
        },
        Link: {
          url,
        },
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                text: {
                  content: summary,
                },
              },
            ],
          },
        },
      ],
    });
    return;
  }

  async getAllItems() {
    try {
      const response = await this.notion.databases.query({
        database_id: process.env.NOTION_DB_ID,
      });
      return response.results;
    } catch (error) {
      throw new Error(''); // TODO - define error properly
    }
  }

  async getItem() {
    const response = await this.notion.databases.query({
      database_id: process.env.NOTION_DB_ID,
    });
    return response.results;
  }
}
