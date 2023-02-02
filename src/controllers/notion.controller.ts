import { Body, Controller, Get, Post, UseFilters } from '@nestjs/common';
import { NotionService } from '../services/notion.service';
import { AllExceptionsFilter } from '../shared/exceptions';

@Controller('notion')
export class NotionController {
  constructor(private readonly notionService: NotionService) {}

  @UseFilters(AllExceptionsFilter)
  @Get()
  async getPages(): Promise<any> {
    try {
      return this.notionService.getAllItems();
    } catch (error) {
      throw error;
    }
  }

  @UseFilters(AllExceptionsFilter)
  @Post()
  async createPage(@Body() body: any): Promise<any> {
    try {
      await this.notionService.createPage(body);
    } catch (error) {
      throw error;
    }
  }
}
