import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { Medium } from '../../models/content/content.type';
import { NotionPageDetails } from './notion.type';
import { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints';

@Injectable()
export class NotionService {
  notion: Client;

  constructor() {
    this.notion = new Client({ auth: process.env.NOTION_API_KEY });
  }

  async createPage(details: NotionPageDetails): Promise<NotionPageDetails> {
    const { title, creator, categories, time, summary, url, medium } = details;

    const categoryIds = await this.retrieveCategoryIds(categories);
    const pageContent = this.getPageContent(summary);

    const response = await this.notion.pages.create({
      parent: {
        type: 'database_id',
        database_id: process.env.NOTION_MAIN_DB_ID, // TODO - This needs to come from the user
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
          relation: categoryIds.map((id) => ({ id })),
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

    return { ...details, notionId: response.id, categoryIds };
  }

  private getPageContent(text: string): BlockObjectRequest[] {
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

  private async retrieveCategoryIds(categories: string[]): Promise<string[]> {
    const categoryIdArray = [];

    for (const category of categories) {
      try {
        const categoryIds = await this.searchForExistingCategory(category);

        if (categoryIds) {
          categoryIdArray.push(...categoryIds);
          continue;
        }

        const categoryId = await this.createCategory(category);
        categoryIdArray.push(categoryId);
      } catch (err) {
        console.error(
          `Unable to retrieve or create a category for ${category} | err.message`,
        );
      }
    }

    return categoryIdArray;
  }

  private async searchForExistingCategory(
    category: string,
  ): Promise<string[] | null> {
    let categoryIds = [];
    const searchResults = await this.notion.search({
      query: category,
      filter: {
        value: 'page',
        property: 'object',
      },
      sort: {
        direction: 'ascending',
        timestamp: 'last_edited_time',
      },
    });

    if (searchResults.results.length) {
      categoryIds = searchResults.results
        .map((result) => {
          if (
            result['parent']['database_id'] ===
            process.env.NOTION_CATEGORIES_DB_ID
          ) {
            return result.id;
          }
        })
        .filter((result) => result !== undefined);

      return categoryIds;
    }

    return null;
  }

  private async createCategory(category: string): Promise<string> {
    const result = await this.notion.pages.create({
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

    return result.id;
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
}
