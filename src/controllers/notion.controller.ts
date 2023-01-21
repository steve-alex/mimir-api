import { Body, Controller, Get, Post } from '@nestjs/common';
import { NotionService } from '../services/notion.service';

@Controller('notion')
export class NotionController {
  constructor(private readonly notionService: NotionService) {}

  @Get()
  async getPages(): Promise<any> {
    try {
      return this.notionService.getAllItems();
    } catch (err) {
      console.log('err =>', err);
    }
  }

  @Post()
  async createPage(@Body() body: any): Promise<any> {
    await this.notionService.createPage(body);
    console.log('body =>', body);
    return {};
  }
}
