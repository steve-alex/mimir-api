import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { NotionPageDetails } from '../../types/types';
import { Medium } from '../../models/content/content.type';

@Injectable()
export class NotionService {
  notion;
  baseUrl = 'https://api.notion.com/v1';

  constructor() {
    this.notion = new Client({ auth: process.env.NOTION_API_KEY });
  }

  // TODO - A lot of these functions need return types
  async createPage(pageDetails: NotionPageDetails): Promise<any> {
    // TODO - update the return type of this function
    const { title, creator, categories, time, summary, url, medium } =
      pageDetails;
    const categoryIds = await this.retrieveCategoryIds(categories);
    const pageContent = this.getPageContent(summary);

    try {
      const response = await this.notion.pages.create({
        parent: {
          type: 'database_id',
          database_id: process.env.NOTION_MAIN_DB_ID,
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
          Creator: {
            select: {
              name: creator,
            },
          },
          Categories: {
            relation: categoryIds,
          },
          Link: {
            url,
          },
          Time: {
            rich_text: [
              {
                text: {
                  content: `${time}`,
                },
              },
            ],
          },
          Status: {
            select: {
              name: 'Inbox',
            },
          },
          Medium: {
            select: {
              name: this.parseMedium(medium),
            },
          },
        },
        children: pageContent,
      });

      return {
        pageDetails: { ...pageDetails, notion_id: response.id, categoryIds },
        status: 'SUCCESS',
      };
    } catch (err) {
      return {
        pageDetails: null,
        status: 'ERROR',
      };
    }
  }

  private getPageContent(text: string) {
    if (text) {
      return text.split(`\n`).map((text) => {
        return {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                text: {
                  content: text,
                },
              },
            ],
          },
        };
      });
    }

    return [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              text: {
                content: 'Summary',
              },
            },
          ],
        },
      },
    ];
  }

  private async retrieveCategoryIds(categories: string[]) {
    const categoryIdArray = [];
    try {
      for (const c of categories) {
        const searchResults = await this.notion.search({
          query: c,
          filter: {
            value: 'page',
            property: 'object',
          },
          sort: {
            direction: 'ascending',
            timestamp: 'last_edited_time',
          },
        });

        let categoryFound = false;

        if (!searchResults.results.length) {
          const result = await this.createCategory(c);
          categoryIdArray.push({
            id: result.id,
          });
          categoryFound = true;
          continue;
        }

        for (const result of searchResults.results) {
          if (
            result.parent.database_id === process.env.NOTION_CATEGORIES_DB_ID
          ) {
            categoryIdArray.push({
              id: result?.id,
            });
            categoryFound = true;
            break;
          }
        }

        if (!categoryFound) {
          const result = await this.createCategory(c);
          categoryIdArray.push({
            id: result.id,
          });
          categoryFound = true;
        }
      }
    } catch (err) {
      throw new Error(err.message);
    }

    return categoryIdArray;
  }

  private async createCategory(category: string) {
    return this.notion.pages.create({
      parent: {
        type: 'database_id',
        database_id: process.env.NOTION_CATEGORIES_DB_ID,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: category,
              },
            },
          ],
        },
      },
    });
  }

  private parseMedium(medium: Medium): string {
    if (medium === Medium.WebPage) return 'Web Page';
    if (medium === Medium.YouTube) return 'YouTube';
    return 'Other';
  }

  async updatePage(
    pageId: string,
    pageDetails: NotionPageDetails,
  ): Promise<void> {
    const { status } = pageDetails;
    const updatedProperties = {
      Status: {
        select: {
          name: status,
        },
      },
    };
    await this.notion.pages.update({
      page_id: pageId,
      properties: updatedProperties,
    });
  }

  async getAllItems() {
    try {
      const response = await this.notion.databases.query({
        database_id: process.env.NOTION_MAIN_DB_ID,
      });
      return response.results;
    } catch (error) {
      throw new Error('error'); // TODO - define error properly
    }
  }

  async getItem() {
    const response = await this.notion.databases.query({
      database_id: process.env.NOTION_MAIN_DB_ID,
    });
    return response.results;
  }
}
