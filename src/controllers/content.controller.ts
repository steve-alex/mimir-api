import { Controller, Post, Req } from '@nestjs/common';
import { ContentService } from '../services/content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  async createPage(@Req() req): Promise<any> {
    try {
      await this.contentService.createPage(req);
    } catch (err) {
      console.log('error =>', err.message);
    }
  }
}
