import { Controller, Post, Req, UseFilters } from '@nestjs/common';
import { ContentService } from '../services/content.service';
import { AllExceptionsFilter } from '../shared/exceptions';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @UseFilters(AllExceptionsFilter)
  @Post()
  async createPage(@Req() req): Promise<any> {
    try {
      await this.contentService.createPage(req);
    } catch (error) {
      throw error;
    }
  }
}
