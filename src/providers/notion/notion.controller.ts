import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { NotionService } from './notion.service';
import { Response } from '../../types/types';
import { NotionPageDetails } from './notion.type';

@Controller('notion')
export class NotionController {
  constructor(private readonly notionService: NotionService) {}
  @Post()
  async createPage(@Body() body: NotionPageDetails): Promise<Response<any>> {
    const pageDetails = await this.notionService.createPage(body);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Notion page successfully created',
      data: pageDetails,
    };
  }
}
