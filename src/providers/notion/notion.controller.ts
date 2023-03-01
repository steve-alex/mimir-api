import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { NotionService } from './notion.service';
import { NotionPageDetails, Response } from '../../types/types';

@Controller('notion')
export class NotionController {
  constructor(private readonly notionService: NotionService) {}

  @Get()
  async getPages(): Promise<Response<any>> {
    const items = await this.notionService.getAllItems();
    return {
      data: items,
      statusCode: HttpStatus.OK,
      message: 'Pages successfully retreived',
    };
  }

  @Post()
  async createPage(@Body() body: NotionPageDetails): Promise<Response<any>> {
    await this.notionService.createPage(body);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Notion page successfully created',
    };
  }
}
